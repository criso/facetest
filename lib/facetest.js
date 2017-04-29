// module dependency
var fbgraph  = require('fbgraph');

/**
 * @private
 * @param {object} params
 * @param {function} callback
 */

function sendNewUserRequest(fbConfig, params, callback) {
  fbgraph.post(fbConfig.appId + '/accounts/test-users', params, callback);
}


/**
 * @private
 * @param {object} reqFrom
 * @param {object} reqTo
 * @param {function} callback
 */

function sendFriendRequest(reqFrom, reqTo, callback) {
  fbgraph
    .setAccessToken(reqFrom.access_token)
    .post(reqFrom.id + "/friends/" + reqTo.id, callback);
}


/**
 * @private
 * @param {object} reqFrom
 * @param {object} reqTo
 * @param {function} callback
 */

function sendAndAcceptFriendRequest(reqFrom, reqTo, callback) {
  sendFriendRequest(reqFrom, reqTo, (err, res) => {
    if (err) {
      callback(err, res, reqFrom, reqTo);
    } else {
      sendFriendRequest(reqTo, reqFrom, (err, res) => {
        callback(err, res, reqFrom, reqTo);
      });
    }
  });
}


/**
 * @private
 * @param {object}
 * @param {function} callback
 */

function removeTestUser(fbConfig, user, callback) {
  fbgraph
    .setAccessToken(fbConfig.appId + "|" + fbConfig.appSecret)
    .del(user.id, callback);
}


/**
 * FaceTest
 */

function FaceTest(fbConfig) {
  if (!fbConfig) throw new Error("Facebook config data is required");

  // Facebook config
  this.fbConfig      = fbConfig;
  this.facebookUsers = {};
  this.userParams    = {
      permissions:   this.fbConfig.scope
    , access_token:  this.fbConfig.appId + "|" + this.fbConfig.appSecret
    , installed:     this.fbConfig.appInstalled
  };
}


/**
 * @param {object} users
 */

FaceTest.prototype.setFacebookUsers = function(users) {
  this.facebookUsers = users;
};


/**
 * @returns {object} facebookUsers
 */

FaceTest.prototype.getFacebookUsers = function() {
  return this.facebookUsers;
};

/**
 * @param {string} name
 * @returns object - facebook user object
 */
FaceTest.prototype.getFacebookUser = function(name) {
  return this.facebookUsers[name] || null;	
};


/**
 * Delete all facebook test users
 * and remove all facebook users from `facebookUsers`
 * @param {function} callback
 */

FaceTest.prototype.removeAllFacebookUsers = function(callback) {
  var self = this;

  /**
   * validate maintains `this` context
   * @param {object} err, res, name
   */

  function validate(err, res, name) {
    if (err) {
      callback(err, null);
    } else {
      delete this.facebookUsers[name];
      if (!Object.keys(this.facebookUsers).length) callback(err, res);
    }
  }

  for (var userName in this.facebookUsers)
    this.removeFacebookUser(userName, validate);
};


/**
 * Delete facebook test user from facebook
 * and remove test user from `facebookUsers`
 * @param {string} name
 * @param {function} callback
 */

FaceTest.prototype.removeFacebookUser = function (name, callback) {
  var self  = this;
  removeTestUser(this.fbConfig, this.facebookUsers[name], (err, res) => {
    delete(self.facebookUsers[name]);
    callback.call(self, err, res, name);
  });
};


/**
 * Create a friend relationship between two users
 * This involves sendind and accepting a friend request
 * @param {string} reqFrom
 * @param {string} reqTo
 * @param {function} callback
 */

FaceTest.prototype.friendUser = function(reqFrom, reqTo, callback) {
  var self  = this;
  var users = this.facebookUsers;

  sendAndAcceptFriendRequest(users[reqFrom], users[reqTo], (err, res) => {
    callback.call(self, err, res, reqFrom, reqTo);
  });
};


/**
 * Create a facebook test user
 * @param {string} name
 * @param {function} callback
 */

FaceTest.prototype.createUser = function (name, callback) {
  var self    = this;
  var params  = this.userParams;

  params[name] = name;

  sendNewUserRequest(this.fbConfig, params, (err, res) => {
    if (!err) {
      var user                 = {};
      user[name]               = res;
      self.facebookUsers[name] = res;
      res                      = user;
    }

    callback(err, res);
  });
};


/**
 * Create several facebook test users
 * @param {array} userList
 * @param {function} callback
 */

FaceTest.prototype.createUsers = function (userList, callback) {
  var userCount = userList.length;
  var self      = this;

  userList.forEach(userName => {
    self.createUser(userName, (err, user) => {
      if (err) {
        callback(err, null); 
      } else {
        userCount--;
        if (!userCount) callback(err, self.facebookUsers);
      }
    });
  });
};


/**
 * Create facebook users that are friends with 
 * each other. This is based on a `anchor` user
 * whish is the key of the object. This user will be 
 * friends with all the users in its associated array
 * @param {object} list
 * @param {function} callback
 *  { 'anchor user': ['user1', 'user2', 'user3'] }
 */

FaceTest.prototype.createFriends = function(friendList, callback) {
  var self           = this;

  var // 'anchor'
  reqFrom        = Object.keys(friendList)[0];

  var // ['a', 'b', 'c']
  reqToList      = friendList[reqFrom];

  var newUsersList   = reqToList.concat(reqFrom);
  var friendReqCount = reqToList.length;

  /**
   * validate maintains `this` context
   * @param {object} err, res, _reqFrom, _reqTo
   */
  function validate (err, res, _reqFrom, _reqTo) {
    if (err) {
      callback(err, null); 
    } else {
      // add friends to reqFrom
      this
        .facebookUsers[_reqFrom]
        .friends
        .push(this.facebookUsers[_reqTo]);

      // reqTo is now linked to reqFrom
      if (!this.facebookUsers[_reqTo][0]) {
        this
          .facebookUsers[_reqTo]
          .friends
          .push(this.facebookUsers[_reqFrom]);
      }

      friendReqCount--;
      if (!friendReqCount) callback(err, this.facebookUsers); 
    }
  }

  // after all users have been created
  // send and accept friend requests based on 
  // `reqFrom`: [`reqTo`, `reqTo`]
  this.createUsers(newUsersList, (err, users) => {
    if (err) {
      callback(err, null);
    } else {
      var facebookUsers              = self.facebookUsers;
      facebookUsers[reqFrom].friends = [];

      reqToList.forEach(reqTo => {
        facebookUsers[reqTo].friends = [];
        self.friendUser(reqFrom, reqTo, validate);
      });
    }
  });
};


module.exports = FaceTest;

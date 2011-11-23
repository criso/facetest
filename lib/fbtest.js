var fbConfig = require('./config').facebook
  , fbgraph  = require('fbgraph');


/**
 * @private
 * @param {object} params
 * @param {function} callback
 */

function sendNewUserRequest(params, callback) {
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
  sendFriendRequest(reqFrom, reqTo, function (err, res) {
    if (err) {
      callback(err, res, reqFrom, reqTo);
    } else {
      sendFriendRequest(reqTo, reqFrom, function (err, res) {
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

function removeTestUser(user, callback) {
  fbgraph
    .setAccessToken(fbConfig.appId + "|" + fbConfig.appSecret)
    .del(user.id, callback);
}


/**
 * FaceTest
 */

function FaceTest() {
  this.facebookUsers = {};
  this.userParams    = {
      permissions:   fbConfig.scope
    , access_token:  fbConfig.appId + "|" + fbConfig.appSecret
    , installed:     fbConfig.appInstalled
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
 * @param {string} name
 * @param {function} callback
 */

FaceTest.prototype.removeFacebookUser = function (name, callback) {
  var self  = this;
  removeTestUser(this.facebookUsers[name], function (err, res) {
    callback.call(self, err, res, name);
  });
};


/**
 * @param {string} reqFrom
 * @param {string} reqTo
 * @param {function} callback
 */

FaceTest.prototype.friendUser = function(reqFrom, reqTo, callback) {
  var self  = this
    , users = this.facebookUsers;

  sendAndAcceptFriendRequest(users[reqFrom], users[reqTo], function (err, res) {
    callback.call(self, err, res, reqFrom, reqTo);
  });
};


/**
 * @param {string} name
 */

FaceTest.prototype.createUser = function (name, callback) {
  var self    = this
    , params  = this.userParams;

  params[name] = name;

  sendNewUserRequest(params, function (err, res) {
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
 * @param {array} userList
 */

FaceTest.prototype.createUsers = function (userList, callback) {
  var userCount = userList.length
    , self      = this;

  userList.forEach(function(userName) {
    self.createUser(userName, function (err, user) {
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
 * @param {object} list
 *  {
 *   'anchor user': ['user1', 'user2', 'user3']
 *  }
 */

FaceTest.prototype.createFriends = function(friendList, callback) {

  var self           = this
    , reqFrom        = Object.keys(friendList)[0] // 'anchor'
    , reqToList      = friendList[reqFrom] // ['a', 'b', 'c']
    , newUsersList   = reqToList.concat(reqFrom)
    , friendReqCount = reqToList.length;

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
  this.createUsers(newUsersList, function (err, users) {
    if (err) {
      callback(err, null);
    } else {
      var facebookUsers              = self.facebookUsers;
      facebookUsers[reqFrom].friends = [];

      reqToList.forEach(function(reqTo) {
        facebookUsers[reqTo].friends = [];
        self.friendUser(reqFrom, reqTo, validate);
      });
    }
  });
};


module.exports = FaceTest;

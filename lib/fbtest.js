var fbConfig = require('./config').facebook
  , fbgraph  = require('fbgraph')
  , util     = require("util")
  , events   = require("events");


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
 * @returns promise
 */
FaceTest.prototype.createUser = function (name) {
  var self    = this
    , params  = this.userParams
    , promise = new events.EventEmitter();

  params[name] = name;

  sendNewUserRequest(params, function (err, res) {
    if (err) {
      promise.emit('error', err);
    } else {
      var user   = {};
      user[name] = res;
      self.facebookUsers[name] = res;

      promise.emit('success', user);
    }
  });

  return promise;
};


/**
 * @param {array} userList
 * @returns promise
 */
FaceTest.prototype.createUsers = function (userList) {
  var promise   = new events.EventEmitter()
    , userCount = userList.length
    , self      = this;

  userList.forEach(function(userName) {
    self
      .createUser(userName)
      .on('error', function (err) {
        promise.emit('error', err);
      })
      .on('success', function (facebookUser) {
        userCount--;
        if (!userCount) promise.emit('success', self.facebookUsers);
      });
  });

  return promise;
};


/**
 * @param {object} list
 *  {
 *   'anchor user': ['user1', 'user2', 'user3']
 *  }
 *
 * @returns promise
 */
FaceTest.prototype.createFriends = function(friendList) {

  var self           = this
    , promise        = new events.EventEmitter()
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
      promise.emit('error', err);
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
      if (!friendReqCount)
        promise.emit('success', this.facebookUsers);
    }
  }

  this
    .createUsers(newUsersList)
    .on('error', function (err) {
      promise.emit('error', err);
    })
    .on('success', function (res) {
      var facebookUsers              = self.facebookUsers;
      facebookUsers[reqFrom].friends = [];

      reqToList.forEach(function(reqTo) {
        facebookUsers[reqTo].friends = [];
        self.friendUser(reqFrom, reqTo, validate);
      });

    });

  return promise;
};


module.exports = FaceTest;

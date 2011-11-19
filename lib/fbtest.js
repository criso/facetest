var fbConfig = require('./config').facebook
  , fbgraph  = require('fbgraph')
  , Queue    = require('./queue')
  , util     = require("util")
  , events   = require("events");


// api
// ---------------------------------------------------
// fbTest
//   .createUsers(['bob', 'ricky', 'blah'])
//   .on('success', function(users) {
//   });
//
// fbTest
//   .createUser('bob')
//   .on('success', function (user) {
//
//   });
//
// fbTest
//   .friends({ 
//     'Magic Man': ['ricky bobby', 'batman'] 
//   })
//   .on('success', function (friends) {
//
//   });
// ---------------------------------------------------

/**
 * @private
 */
function sendNewUserRequest(params, callback) {
  fbgraph.post(fbConfig.appId + '/accounts/test-users', params, callback);
}

function sendFriendRequest(reqUser, resUser, callback) {
  fbgraph
    .setAccessToken(reqUser.access_token)
    .post(reqUser.id + "/friends/" + resUser.id, callback);
}

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

FaceTest.prototype.setFacebookUsers = function(users) {
  this.facebookUsers = users;
};

FaceTest.prototype.getFacebookUsers = function() {
  return this.facebookUsers;
};

FaceTest.prototype.removeAllFacebookUsers = function(callback) {
  var self = this;

  function validate(err, res, name) {
    if (err) callback(err, null);

    delete self.facebookUsers[name];
    if (!Object.keys(self.facebookUsers).length) callback(err, res);
  }

  for (var userName in this.facebookUsers) {
    this.removeFacebookUser(userName, validate);
  }

};

FaceTest.prototype.removeFacebookUser = function (name, callback) {
  removeTestUser(this.facebookUsers[name], function (err, res) {
    callback(err, res, name);
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

  // console.log("creating user: ", name);
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

  // console.log("userCount", userCount);
  userList.forEach(function(userName) {
    self
      .createUser(userName)
      .on('error', function (err) { promise.emit('error', err); })
      .on('success', function (facebookUser) {
        userCount--;
        // console.log("user", facebookUser);
        // console.log("userCount", userCount);
        if (!userCount) promise.emit('success', self.facebookUsers);
      });
  });

  return promise;
};


/**
 * @param {object} list
 * @returns promise
 */
FaceTest.prototype.friends = function(list) {

  var self           = this
    , promise        = new events.EventEmitter()
    , anchorUserName = Object.keys(list)
    , friendsCount   = 0
    , userList       = list[anchorUserName];

  this
    .createUsers(list)
    .on('error', function (err) { promise.emit('error', err); })
    .on('success', function (fbUsers) {
      friendsCount   = Object.keys(fbUsers).length;
      var anchorUser = fbUsers[anchorUserName]

      for (var name in fbUsers) {
        if (name !== anchorUserName) {
          self.sendAndAcceptFriendRequest(anchorUser, fbUsers[name], validate);
        }
      }
    });

  function validate (err, res) {
    if (err)
      promise.emit('error', err);
    else if (!--friendsCount)
      promise.emit('success', res);
  }

  return promise;
};

/**
 * @param {object} reqUser
 * @param {object} resUser
 * @param {function} callback
 */
FaceTest.prototype.sendAndAcceptFriendRequest = function(reqUser, resUser, callback) {
  sendFriendRequest(reqUser, resUser, function (err, res) {
    if (err) callback(err, res)
    else sendFriendRequest(resUser, reqUser, callback)
  });
};


module.exports = FaceTest;

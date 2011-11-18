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



function FaceTest() {
  this.facebookUsers = {};
  this.userParams    = {
      permissions:   fbConfig.scope
    , access_token:  fbConfig.appId + "|" + fbConfig.appSecret
    , installed:     fbConfig.appInstalled
  };

}

/**
 * @param {string} name
 * @returns promise
 */
FaceTest.prototype.createUser = function (name) {
  var params = this.userParams
    , promise = new events.EventEmitter();

  params[name] = name;

  sendNewUserRequest(params, function (err, res) {
    err ? promise.emit('error', err)
        : promise.emit('success', res);
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
    this
      .createUser(userName)
      .on('error', function (err) { promise.emit('error', err); })
      .on('success', function (user) {
        self.facebookUsers[userName] = user;

        if (!--userCount) promise.emit('success', self.facebookUsers);
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



var fbConfig = require('./config').facebook
  , fbgraph  = require('fbgraph')
  , Queue    = require('./queue')
  , util     = require("util")
  , events   = require("events");

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

function sendAndAcceptFriendRequest(reqUser, resUser, callback) {
  this.sendFriendRequest(reqUser, resUser, function (err, res) {
    if (err) callback(err, res);
    sendFriendRequest(resUser, reqUser, callback);
  })
}


function FaceTest() {
  this.userList   = [];
  this.userParams = {
      permissions:   fbConfig.scope
    , access_token:  fbConfig.appId + "|" + fbConfig.appSecret
    , installed:     fbConfig.appInstalled
  };

}

FaceTest.prototype.addToList = function (user) {
  this.userList.push(user);
  if (!--this.queue) {
    this.emit('userList::created', this.userList);
  }
};


FaceTest.prototype.createUser = function (params) {
  var self = this;
  this.queue++;
  // adds to queue
  sendNewUserRequest(params, function (err, res) {
    if (err) self.emit('error', err);
    var user = {};
    user[name] = res;
    self.emit('user::created', user);
  });
};


FaceTest.prototype.createUsers = function (names, callback) {
  var params = this.usersParams;
  for (var i=0; len = names.length; i++) {
    params.name = names[i];
    this.createUser(params)
  }
};

// only fires after the user list has been created
FaceTest.prototype.friendsWith = function(name) {
  var self = this;
  this.on('users::created', function(userList) {

    var mainUser = userList.pop(); // or shift  => userList[0];
    userList.forEach(function(user, index) {
      sendAndAcceptFriendRequest(mainUser, user, function (err, res) {
        if (err) self.emit('error');
      });
    });
  });
};

// -------------------- Seems to be the best one so far --------------

fbtest
  .createFriends({
    {main: [friend, friend, friend]} 
  })
  .on('end', function(userList) {
  
  });

FaceTest.prototype.createFriends(obj) {
  var user = key
    , friends = key[array];

  createUser(user, function(err, res) {

    var queue = friends.length;
    friends.forEach(function (friendName) {
    
      createFriend(user, friendName, function (err, res) {
        if (err) self.emit('error', err);

        if (--queue === 0) {
          self.emit('end');
        }
      });
    });


  });

}

FaceTest.prototype.createFriend(user, friendName, callback) {
  createUser(friendName, function(err, friend) {
    sendAndAcceptFriendRequest(user, friend, callback);
  });
}


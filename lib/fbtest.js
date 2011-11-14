var fbConfig = require('./config').facebook
  , fbgraph  = require('fbgraph')
  , Queue    = require('./queue');

/**
 *
 */
function User (options) {

  if (!(this instanceof User)) return new User();

  var self = this;

  this.queue = new Queue();
  this.users = [];

  // defaults
  var params = {
      permissions:   fbConfig.scope
    , access_token:  fbConfig.appId + "|" + fbConfig.appSecret
    , installed:     fbConfig.appInstalled
  };

  var url = fbConfig.appId + '/accounts/test-users';

  typeof options == 'string'
      ?  options = { name: options }
      : options && options.name || (options = {name: "user" + Date.now()});

  // extend defaults
  for (var key in options) params[key] = options[key];

  fbgraph.post(url, params, function (err, user) {
    if (err) throw new Error(err);

    var obj = {};
    obj[params.name.toLowerCase()] = user;

    self.users.push(obj);
    self.queue.flush(self);
  });

  return this;
}

User.prototype.getUsers = function() {
  this.queue.add(function (self) {
    return self.users;
  });

  return this;
};


function sendFriendRequest(fromUser, toUser, callback) {
  fbgraph
    .setAccessToken(fromUser.access_token)
    .post(fromUser.id + "/friends/" + toUser.id, callback);
}


/**
 *
 */
User.prototype.friendsWith = function(toUsers) {
  this.queue.add(function (self) {
    self.users.forEach(function (fromUser) {

      // friend each `fromUser` with every user in the `toUsers`
      toUsers.forEach(function (toUser) {
        sendFriendRequest(fromUser, toUser, function (err, res) {
          if (err) throw new Error(err);

          // accept friend request
          sendFriendRequest(toUser, fromUser, function (err, res) {

          });
        });
      });
    });
  });

  return this;
};


User.prototype.getUser = function(name) {
  this.queue.add(function (self) {
    name = name.toLowerCase();
    return self.users.filter(function (user) {
      return user[name];
    })[0][name] || null;
  });

  return this;
};


exports.User = User;

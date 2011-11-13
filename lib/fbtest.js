var fbConfig = require('./config').facebook
  , fbgraph  = require('fbgraph');

var users = [];

/**
 *
 */
exports.createUser = function (options, callback) {
  var params = {
      permissions:   fbConfig.scope
    , access_token:  fbConfig.appId + "|" + fbConfig.appSecret
    , installed:     fbConfig.appInstalled
  };

  typeof options == 'string'
      ?  options = { name: options }
      : options && options.name || (options = {name: "user" + Date.now()});

  for (var key in options) params[key] = options[key];

  fbgraph.post(fbConfig.appId + "/accounts/test-users", params, function (err, user) {

    if (!err) {
      var obj = {};
      obj[params.name.toLowerCase()] = user;
      users.push(obj);
    }

    callback(err, user);
  });
};


/**
 *
 */

exports.getUser = function (name) {
  name = name.toLowerCase();
  return users.filter(function (user) { return user[name] })[0][name] || null;
};

/**
 *
 */

exports.getUsers = function () {
  return users;
};


/**
 *
 */

function friend(fromUser, toUser, callback) {
  fbgraph
    .setAccessToken(fromUser.access_token)
    .post(fromUser.id + "/friends/" + toUser.id, callback);
}


/**
 *
 */

exports.friendRequest = function (options, callback) {
  Array.isArray(options.to) || (options.to = [options.to]);

  var self     = this
    , fromUser = this.getUser(options.from)
    , toUser   = null
    , calls    = 0;

  options.to.forEach(function (to) {
    toUser = self.getUser(to);

    // send friend request
    friend(fromUser, toUser, function(err, res) {
      if (!err) {
        // accept friend request
        friend(toUser, fromUser, function (err, res) {
            // after all friend requests have been accepted
            if (++calls == options.to.length) callback(err, res);
        });
      }
    });
  });
};

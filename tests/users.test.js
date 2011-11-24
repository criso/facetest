// dependencies
var vows     = require('vows')
  , assert   = require('assert') 
  , FaceTest = require('../index')
  , fbConfig = require('./config').facebook;

var facetest = new FaceTest(fbConfig);

// test Data
var testData = {
    singleUser: 'Magic Man'
  , multipleUsers: ['Ricky Bobby', 'El Diablo', 'Magic Man']
  , friends: {
    'Ron Burgundy': ['Ricky Bobby', 'El Diablo', 'Veronica Corningstone']
  }
};


vows.describe("testUser.test").addBatch({
  'When creating a single user': {

    topic: function () {
      facetest.createUser(testData.singleUser, this.callback);
    },

    "on success it should return the user": function(err, user) {
      var name = testData.singleUser;

      assert.isNull(err);
      assert.include(user, name);
      assert.include(user[name], 'access_token');
      assert.include(user[name], 'login_url');
      assert.include(user[name], 'email');
      assert.include(user[name], 'password');
    },

    "and retrieving the userList ":  {

      topic: function () {
        return facetest.getFacebookUsers();
      },

      "it should contain the created user": function(userList) {
        var name = testData.singleUser;
        assert.include(userList, name);
        assert.include(userList[name], 'access_token');
        assert.include(userList[name], 'login_url');
        assert.include(userList[name], 'email');
        assert.include(userList[name], 'password');
      }
    }
  }
}).addBatch({
  'After single user creation': {
    topic:  function () {
      facetest.removeAllFacebookUsers(this.callback); 
    },

    'test users should be deleted': function (err, res) {
      assert.isNull(err);
      assert.equal(res.data, "true");
      assert.isEmpty(facetest.getFacebookUsers());
    }
  }
}).addBatch({
  'When creating multiple users': {
    topic: function () {
      facetest.createUsers(testData.multipleUsers, this.callback);
    },

    "on success it should return the list of users": function(err, userList) {
      assert.isNull(err);
      testData.multipleUsers.forEach(function (name) {
        assert.include(userList, name);
        assert.include(userList[name], 'access_token');
        assert.include(userList[name], 'login_url');
        assert.include(userList[name], 'email');
        assert.include(userList[name], 'password');
      });
    },

    "and retrieving the userList ":  {

      topic: function () {
        return facetest.getFacebookUsers();
      },

      "it should contain all the created users": function(userList) {
        testData.multipleUsers.forEach(function (name) {
          assert.include(userList, name);
          assert.include(userList[name], 'access_token');
          assert.include(userList[name], 'login_url');
          assert.include(userList[name], 'email');
          assert.include(userList[name], 'password');
        });
      }
    }
  }
}).addBatch({
  'After multiple users creation': {
    topic:  function () {
      facetest.removeAllFacebookUsers(this.callback); 
    },

    'test users should be deleted': function (err, res) {
      assert.isNull(err);
      assert.equal(res.data, "true");
      assert.isEmpty(facetest.getFacebookUsers());
    }
  }
}).addBatch({
  'When creating users who are friends with each other': {
    topic: function () {
      facetest.createFriends(testData.friends, this.callback);
    },

    "on success it should return a list of valid users": function(err, userList) {
      // testData
      var reqFrom      = Object.keys(testData.friends)[0]
        , reqToList    = testData.friends[reqFrom]
        , newUsersList = reqToList.concat(reqFrom);

      newUsersList.forEach(function (name) {
        assert.include(userList, name);
        assert.include(userList[name], 'access_token');
        assert.include(userList[name], 'login_url');
        assert.include(userList[name], 'email');
        assert.include(userList[name], 'password');
      });
    },

    "req user obj should have an array of valid friend users": function (err, userList) {
      // testData
      var reqFrom = Object.keys(testData.friends)[0]
        , reqUser = userList[reqFrom];

      Object.keys(reqUser.friends).forEach(function (name) {
        assert.include(testData.friends.reqFrom, name);

        reqUser.friends.forEach(function (friend) {
          assert.include(userList[name], 'access_token');
          assert.include(userList[name], 'login_url');
          assert.include(userList[name], 'email');
          assert.include(userList[name], 'password');
        });
      });

    },

    "main user should have right amount of friends": function (err, userList) {
      var reqFrom = Object.keys(testData.friends)[0];
      assert.equal(userList[reqFrom].friends.length, testData.friends[reqFrom].length);
    },

    "retrieving user by name should work should return a valid user": function (err, userList) {
      var key  = Object.keys(testData.friends)[0]
        , user = facetest.getFacebookUser(testData.friends[key][0]);

      assert.include(user, 'access_token');
      assert.include(user, 'login_url');
      assert.include(user, 'email');
      assert.include(user, 'password');
    }

  }
}).addBatch({
  'After Friends Creation': {
    topic:  function () {
      facetest.removeAllFacebookUsers(this.callback); 
    },

    'test users should be deleted': function (err, res) {
      assert.isNull(err);
      assert.equal(res.data, "true");
      assert.isEmpty(facetest.getFacebookUsers());
    }
  }
}).export(module);

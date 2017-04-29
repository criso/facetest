// dependencies
var vows     = require('vows');

var assert   = require('assert');
var FaceTest = require('../index');
var fbConfig = require('./config').facebook;

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

    topic() {
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

      topic() {
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
    topic() {
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
    topic() {
      facetest.createUsers(testData.multipleUsers, this.callback);
    },

    "on success it should return the list of users": function(err, userList) {
      assert.isNull(err);
      testData.multipleUsers.forEach(name => {
        assert.include(userList, name);
        assert.include(userList[name], 'access_token');
        assert.include(userList[name], 'login_url');
        assert.include(userList[name], 'email');
        assert.include(userList[name], 'password');
      });
    },

    "and retrieving the userList ":  {

      topic() {
        return facetest.getFacebookUsers();
      },

      "it should contain all the created users": function(userList) {
        testData.multipleUsers.forEach(name => {
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
    topic() {
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
    topic() {
      facetest.createFriends(testData.friends, this.callback);
    },

    "on success it should return a list of valid users": function(err, userList) {
      // testData
      var reqFrom      = Object.keys(testData.friends)[0];

      var reqToList    = testData.friends[reqFrom];
      var newUsersList = reqToList.concat(reqFrom);

      newUsersList.forEach(name => {
        assert.include(userList, name);
        assert.include(userList[name], 'access_token');
        assert.include(userList[name], 'login_url');
        assert.include(userList[name], 'email');
        assert.include(userList[name], 'password');
      });
    },

    "req user obj should have an array of valid friend users": function (err, userList) {
      // testData
      var reqFrom = Object.keys(testData.friends)[0];

      var reqUser = userList[reqFrom];

      Object.keys(reqUser.friends).forEach(name => {
        assert.include(testData.friends.reqFrom, name);

        reqUser.friends.forEach(friend => {
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
      var key  = Object.keys(testData.friends)[0];
      var user = facetest.getFacebookUser(testData.friends[key][0]);

      assert.include(user, 'access_token');
      assert.include(user, 'login_url');
      assert.include(user, 'email');
      assert.include(user, 'password');
    }

  }
}).addBatch({
  'After Friends Creation': {
    topic() {
      facetest.removeAllFacebookUsers(this.callback); 
    },

    'test users should be deleted': function (err, res) {
      assert.isNull(err);
      assert.equal(res.data, "true");
      assert.isEmpty(facetest.getFacebookUsers());
    }
  }
}).export(module);

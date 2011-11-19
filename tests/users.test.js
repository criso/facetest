var fbgraph  = require('fbgraph')
  , fbConfig = require('./config').facebook
  , vows     = require('vows')
  , assert   = require('assert') 
  , FaceTest = require('../index');

var faceTest       = new FaceTest()
  , appAccessToken = fbConfig.appId + "|" + fbConfig.appSecret;


// test Data
var testData = {
    singleUser: 'Magic Man'
  , multipleUsers: ['Ricky Bobby', 'El Diablo', 'Magic Man']
};



// do we need to reset fbgraph?
vows.describe("testUser.test").addBatch({
  "Before starting a test suite": {
    topic:  function () {
      return fbgraph.setAccessToken(null);
    },

    "*access token* should be null": function (fbgraph) {
      assert.isNull(fbgraph.getAccessToken());
    }
  }
}).addBatch({

  'When creating a single user': {
  
    topic: function () {
      return faceTest.createUser(testData.singleUser);
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
        return faceTest.getFacebookUsers();
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
      faceTest.removeAllFacebookUsers(this.callback); 
    },

    'test users should be deleted': function (err, res) {
      assert.isNull(err);
      assert.equal(res.data, "true");
      assert.isEmpty(faceTest.getFacebookUsers());
    }
  }
}).addBatch({
  'When creating multiple users': {
    topic: function () {
      return faceTest.createUsers(testData.multipleUsers);
    },
    
    "on success it should return the list of users": function(userList) {
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
        return faceTest.getFacebookUsers();
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
      faceTest.removeAllFacebookUsers(this.callback); 
    },

    'test users should be deleted': function (err, res) {
      assert.isNull(err);
      assert.equal(res.data, "true");
      assert.isEmpty(faceTest.getFacebookUsers());
    }
  }
}).export(module);

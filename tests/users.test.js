var fbgraph  = require('fbgraph')
  , fbConfig = require('./config').facebook
  , vows     = require('vows')
  , assert   = require('assert');

var faceTest = require('../index');

var appAccessToken = fbConfig.appId + "|" + fbConfig.appSecret;

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

  'test users': {
  
    topic: function () {
      faceTest
        .options()
        // .createUsers(["Magic Man", "El diablo", "roocky"])
        .friends('all') 
        .createUser("Magic Man")
        .friendsWith(["El diablo", "Ricky Bobby"])  // 
        .end(function(self) {
           
        });
    },
    
    "": "pending"

  }

}).addBatch({

  "When tests are over": {
    topic: function () {
      return fbgraph.setAccessToken(appAccessToken);
    },

    "after reseting the access token - ": {
      "test *user 1*": {
        topic: function (fbgraph) {
          fbgraph.del(fbTest.getUser('Magic Man').id, this.callback);
        },

        "should be removed": function(res){
          assert.equal(res.data, "true");
        }
      },

      "test *user 2*": {
        topic: function (fbgraph) {
          fbgraph.del(fbTest.getUser('El Diablo').id, this.callback);
        },

        "should be removed": function(res){
          assert.equal(res.data, "true");
        }
      }
    }
  }
}).export(module);

var fbgraph  = require('fbgraph')
  , fbConfig = require('./config').facebook
  , vows     = require('vows')
  , assert   = require('assert');


var testUser1      = {}
  , testUser2      = {}
  , appAccessToken = fbConfig.appId + "|" + fbConfig.appSecret
  , wallPost       = { 
      message: "I'm gonna come at you like a spider monkey, chip" 
  };

var fbTest = require('../index');


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
  "With test users": {
    topic: function () {
      // create test user
      fbTest.createUser("Magic Man", this.callback);
    },

    "we should be able to create *user 1*": function(res) {
      assert.isNotNull(res);
      testUser1 = res;
    },

    "after creating *user 1*": {
      topic: function (res) {
        fbTest.createUser("El diablo", this.callback);
      },

      "we should be able to create *user 2*": function(res) {
        assert.isNotNull(res);
        testUser2 = res;
      },

      "and *user2* ": {
        topic: function (res) {



          fbTest.friendRequest({
              from:  "Magic Man"
            , to:    "El Diablo"
          }, this.callback);


          // var magicMan = fbTest.getUser("Magic Man")
          //   , elDiablo = fbTest.getUser("El Diablo");

          // elDiablo.on('friendRequest', function (req) {
          //   elDiablo.acceptFriendRequest(magicMan); 
          // });



          // fbTest.friendRequest({
          //     from:  fbTest.getUser("Magic Man")
          //   , to:    fbTest.getUser("El Diablo")
          // }, this.callback);
          

        },

        "*user1* should send a friend request": function(res) {
          assert.isNotNull(res);
        },

        "and after a friend request has been made": {

          topic: function (res) {
            var apiUrl =  testUser2.id + "/friends/" + testUser1.id 
              + "?method=post";

            // The second call should be made with access
            // token for user2 and will confirm the request.
            fbgraph.setAccessToken(testUser2.access_token);
            fbgraph.get(encodeURI(apiUrl), this.callback);
          },

          "*user2* should accept friend request": function (res) {
            assert.equal(res.data, "true");
          },

          " - a post on *user1*'s wall" : {
            topic: function() {

              // Create user 1
              // Create user 2
              // user1.friend.user2
              // user1.post.user2







              fbgraph.setAccessToken(testUser1.access_token);
              fbgraph.post(testUser2.id + "/feed", wallPost, this.callback);
            },

            "should have a response with an id": function (res) {
              assert.include(res, 'id');
            },

            "when queried": {
              topic: function (res) {
                fbgraph.get(res.id, this.callback);
              },

              "should be valid": function (res) {
                assert.isNotNull(res);
                assert.equal(res.message, wallPost.message);
                assert.equal(res.from.id, testUser1.id);
              }
            }
          }
        }
      }
    }
  }
}).addBatch({

  "When tests are over": {
    topic: function () {
      return fbgraph.setAccessToken(appAccessToken);
    },

    "after reseting the access token - ": {
      "test *user 1*": {
        topic: function (fbgraph) {
          fbgraph.del(testUser1.id, this.callback);
        },

        "should be removed": function(res){
          assert.equal(res.data, "true");
        }
      },

      "test *user 2*": {
        topic: function (fbgraph) {
          fbgraph.del(testUser2.id, this.callback);
        },

        "should be removed": function(res){
          assert.equal(res.data, "true");
        }
      }
    }
  }
}).export(module);

var fbgraph  = require('fbgraph')
  , fbConfig = require('./config').facebook
  , vows     = require('vows')
  , assert   = require('assert');

var fbTest = require('../index');

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
     var users =  fbTest
                .User("Magic Man")
                .getUsers();

     return users;
    },

    'chaining': function () {
      console.log(arguments);

    },

    'user should be created': 'pending'

  
  }



// }).addBatch({
//   "With test users": {
//     topic: function () {
//       fbTest.createUser("Magic Man", this.callback);
//     },
// 
//     "we should be able to create *user 1*": function(res) {
//       assert.isNotNull(res);
//     },
// 
//     "after creating *user 1*": {
//       topic: function (res) {
//         fbTest.createUser("El diablo", this.callback);
//       },
// 
//       "we should be able to create *user 2*": function(res) {
//         assert.isNotNull(res);
//       },
// 
//       "and *user2* ": {
//         topic: function (res) {
//           fbTest.friendRequest({
//               from:  "Magic Man"
//             , to:    "El Diablo"
//           }, this.callback);
//         },
// 
//         "*user2* should accept friend request": function (res) {
//           assert.equal(res.data, "true");
//         }
//       }
//     }
//   }
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

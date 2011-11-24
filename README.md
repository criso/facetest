## What?!
[FaceTest](http://criso.github.com/facetest/) - nodejs module to facilitate api tests that require facebook test users

## What?!!
Creating facebook test users is pain.   
If you're building a `facebook` app or a web app that needs interacts with facebook user objects, this should make your life easier.


## Installation via npm
    $ npm install facetest


## Init
When creating a `facetest` object you'll need to pass in a facebook config object.

```js
var config = {
  appId:      <Your App Id>,
  appSecret:  <Your App Secret>,
  appInstalled: true,
  scope:      'email, user_about_me, user_birthday, user_location, publish_stream, read_stream, friends_location',
};

var FaceTest = require('facetest')
  , facetest = new FaceTest(config);

```

## Create a test User
Creates a facebook test user based on name given

```js
    var FaceTest = require('facetest')
      , facetest = new FaceTest(config);

    facetest.createUser('Magic Man', function (err, user) {
      console.log(user); // { 'Magic Man': { id: ..., email: ....} }
    });
```

## Create several test users
Creates facebook test users based on an array of names

```js
    var FaceTest = require('facetest')
      , facetest = new FaceTest(config);

    var multipleUsers = ['Ricky Bobby', 'El Diablo', 'Magic Man'];

    facetest.createUsers(multipleUsers, function(err, users) {
      console.log(users);
      // {
      //  'Ricky Bobby':  { id: ..., email: ....}
      //  'El Diablo':     { id: ..., email: ....}
      //  'Magic Man':     { id: ..., email: ....}
      // }
    });
```

## Create facebook friends
`createFriends()` expects an object containing an array of names
This will create facebook test users for all the names given.  
  
The key of the object is an `anchor user`, which will have a friend
relationship with all the users in the given array.  
  
Each user will have a `friend object`.  

```js
    var FaceTest = require('facetest')
      , facetest = new FaceTest(config);

    var friends = {
      'Ron Burgundy': ['Ricky Bobby', 'El Diablo', 'Veronica Corningstone']
    };

    // Ron Burgundy will be friends with Ricky bobby, El Diablo and Veronica Corningstone
    // Ricky Bobby will *NOT* be friends with El Diablo. Infinite Sadness.
    facetest.createFriends(friends, function(err, users) {
      console.log(users);
      // {
      //    'Ron Burgundy':          { id: ..., email: ...., friends: [object, object, object]}
      //  , 'Ricky Bobby':           { id: ..., email: ...., friends: [object]}
      //  , 'El Diablo':             { id: ..., email: ...., friends: [object]}
      //  , 'Veronica Corningstone': { id: ..., email: ...., friends: [object]}
      // }
    });
```

## Sample test
```js
  var vows     = require('vows')
    , assert   = require('assert')
    , FaceTest = require('facetest');

  var facetest = new FaceTest();

  vows.describe("testUser.test").addBatch({
    'After multiple users creation': {
      topic:  function () {
        var friends = {
          'Ron Burgundy': ['Ricky Bobby', 'El Diablo', 'Veronica Corningstone']
        };

        facetest.createFriends(friends, this.callback);
      },

      'posting a blog post with facebook id':  {
        topic: function (users) {

          var user = facetest.getFacebookUser('El Diablo');
          client.post('/post/1/facebook_id/' + user.id, this.callback);
        },

        'response': function (err, response) {
          // test response from `/post/1/facebook_id/<facebook_id>`
        }
      }
    }
  }).addBatch({
    'After test is over': {
      topic:  function () {
        facetest.removeAllFacebookUsers(this.callback);
      },

      'test users should be deleted': function (err, res) {
        assert.isNull(err);
        assert.equal(res.data, "true");
        assert.isEmpty(faceTest.getFacebookUsers());
      }
    }
  }).export(module);
```

## Running tests

 Before running the test suite, add your Facebook `appId` and `appSecret` to `tests/config.js`   
 This is needed to create `test users` and to get a test `access_token`

    $ npm install
    $ make test

 _Tests might fail if the Facebook api has an issue._

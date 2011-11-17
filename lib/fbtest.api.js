var userList = [];

FaceTest.prototype.friendsWith = function(names) {
  var self = this;

  this.createUser(name, function(user) {
    self.sendAndAcceptFriendRequest(self.mainUser, user, function (err, res) {
      if (err) console.log('ERROR ------- ', err);
    });
  });

};



FaceTest () {
  this.on('write', addToList);

  var queue = new Queue;
  queue.flush(this);


}

FaceTest.prototype.user(name) {
  var params = this.userParams;
  params.name = {name: name};

  this.createUser(params);
};


FaceTest.prototype.addToList = function(user) {
  userList.push(user);
  if (queue.callbacks.length == 0 ) {
    this.emit('end');
  }
};






  // Magic man can post on the walls of el diablo and ricky bobby
  facetest.createFriends({
  'Magic Man': ['El Diablo', 'Ricky Bobby']
  });

  facetest.on('end', function(userList) {
    
  });

var userList = [
  "Magic Man" : {
    email: 
    access_token:

    friends: [
      { 'Ricky bobby'....} 
    ]
  }
];


// user is an array of objects 
// for each friend that is made that friend is pushed into 
// the user's friends[] 
//

fbtest
  .createFriends({
    {main: [friend, friend, friend]} 
  })
  .on('end', function(userList) {
  
  });

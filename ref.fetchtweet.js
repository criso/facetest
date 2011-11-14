fetchTweet(url).linkify().filterBadWords().appendTo('#status');

// Your internals would look like this with the Queue.

function fetchTweet(url) {
  this.queue = new Queue;
  this.tweet = "";
  var self   = this;

  ajax(url, function(resp) {
    self.tweet = resp;
    self.queue.flush(this);
  });

}

fetchTweet.prototype = {

  linkify: function() {

    this.queue.add(function(self) {

      self.tweet = self.tweet.replace(/\b@(\w{1,20}\b/g, '<a href="...">$1</a>');

    });

  return this;

  },



  filterBadWords: function() {

    this.queue.add(function(self) {

      self.tweet = self.tweet.replace(/\b(fuck|shit|piss)\b/g, "");

    });

  return this;

  },



  appendTo: function(selector) {

    this.queue.add(function(self) {

      $(self.tweet).appendTo(selector);

    });

  return this;

  }



};


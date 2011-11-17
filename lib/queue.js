function Queue() {
  // store your callbacks
  this.callbacks = [];

  // keep a reference to your response
  this.response = null;

  // all queues start off unflushed
  this.flushed = false;
}

Queue.prototype.add = function (callback) {
  // if the queue had been flushed, return immediately
  // otherwise push it on the queue
  this.flushed ? callback(this.response)
               : this.callbacks.push(callback);
};

Queue.prototype.flush = function(resp) {
  // note: flush only ever happens once
  if (this.flushed) return;

  // store your response for subsequent calls after flush()
  this.response = resp;

  // mark that it's been flushed
  // this.flushed = true;

  // shift 'em out and call 'em back
  while (this.callbacks[0]) {
    this.callbacks.shift()(resp);
  }
};

module.exports = Queue;

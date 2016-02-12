function Promise() {
  this.tag = "";
  this.delivered = false;
  this.data = null;
  this.error = null;
  this.listeners = [];
}

Promise.prototype.disp = function() {
  console.log("PROMISE");
  if (this.delivered) {
    console.log('    data: %j', this.data);
    if (this.error) {
      console.log('    error: %j', this.error);
    }
  } else {
    console.log('    pending...');
  }
}

Promise.prototype.informListeners = function() {
  assert(this.delivered);
  for (var i = 0; i < this.listeners.length; i++) {
    this.listeners[i](this.error, this.data);
  }
}

Promise.prototype.set = function(err, data) {
  assert(!this.delivered);
  this.error = err;
  this.data = data;
  this.delivered = true;
  this.informListeners();
}

Promise.prototype.get = function(cb) {
  if (this.delivered) {
    cb(this.error, this.data);
  } else {
    this.listeners.push(cb);
  }
}

Promise.prototype.makeSetter = function(onlyValue) {
  var self = this;
  if (onlyValue) {
    return function(value) {
      self.set(null, value);
    }
  } else {
    return function(err, value) {
      self.set(err, value);
    }
  }
}

/////////////////////// ArgArray
function ArgArray(n) {
  this.data = new Array(n);
  this.marked = new Array(n);
  this.counter = 0;
  this.error = null;
  this.listeners = [];
}

ArgArray.prototype.finished = function() {
  return this.error || this.data.length <= this.counter;
}

ArgArray.prototype.inform = function(dst) {
  assert(this.finished());
  if (this.error) {
    dst(this.error);
  } else {
    dst(null, this.data);
  }
}

ArgArray.prototype.get = function(cb) {
  if (this.finished()) {
    this.inform(cb);
  } else {
    this.listeners.push(cb);
  }
}

ArgArray.prototype.tryInformListeners = function() {
  if (this.finished()) {
    for (var i = 0; i < this.listeners.length; i++) {
      this.inform(this.listeners[i]);
    }
  }
}

ArgArray.prototype.set = function(index, err, value) {
  if (!this.finished() && !this.marked[index]) {
    this.error = err;
    this.marked[index] = true;
    this.data[index] = value;
    this.counter++;
    this.tryInformListeners();
  }
}

ArgArray.prototype.makeSetter = function(index) {
  var self = this;
  return function(err, value) {
    self.set(index, err, value);
  };
}


function argsToArray(x) {
  return Array.prototype.slice.call(x);
}

prototype.exports.argsToArray = argsToArray;
prototype.exports.ArgArray = ArgArray;
prototype.exports.Promise = Promise;

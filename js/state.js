var State = function (initialState) {
  this.initial = initialState;

  this.current = _.cloneDeep(initialState);
  this.current.time = 0;

  this.checkpoints = [];
  this.maxTime = 0;
  this.timers = [];
};

State.prototype = _.clone(EventEmitter.prototype);

State.prototype.prev = function(time) {
  return util.greatestLower(this.checkpoints,
                            function(m) { return m.time > time; });
};

State.prototype.runTimers = function (time) {
  var fire = [];
  this.timers = this.timers.filter(function(timer) {
    if (timer.time <= time) {
      fire.push(timer);
      return false;
    } else {
      return true;
    }
  });
  fire.forEach(function(timer) {
    timer.callback();
  });
};

State.prototype.getMaxTime = function () {
  return this.maxTime;
}

State.prototype.init = function () {
  this.checkpoints.push(_.cloneDeep(this.current));
};

State.prototype.fork = function () {
  var i = this.prev(this.current.time);
  while (this.checkpoints.length - 1 > i)
    this.checkpoints.pop();
  this.maxTime = this.current.time;
  this.timers = [];
};

State.prototype.rewind = function (time) {
  this.current = _.cloneDeep(this.checkpoints[this.prev(time)]);
  this.current.time = time;
  this.runTimers(time);
}

State.prototype.base = function () {
  return this.checkpoints[this.prev(this.current.time)];
};

State.prototype.advance = function (time) {
  this.maxTime = time;
  this.current.time = time;
  if (this.updater(this)) {
    this.save();
  }
  this.runTimers(time);
};

State.prototype.save = function () {
  this.checkpoints.push(_.cloneDeep(this.current));
};

State.prototype.seek = function (time) {
  if (time <= this.maxTime) {
    this.rewind(time);
  } else if (time > maxTime) {
    this.advance(time);
  }
};

State.prototype.updater = function() { return false; };

State.prototype.exportToString = function() {
  return JSON.stringify({
    checkpoints: this.checkpoints,
    maxTime: this.maxTime,
  });
};

State.prototype.importFromString = function () {
  var o = JSON.parse(s);
  this.checkpoints = o.checkpoints
  this.maxTime = o.maxTime;
  this.current = _.cloneDeep(checkpoints[0]);
  this.current.time = 0;
  this.timers = [];
};

State.prototype.clear = function () {
  this.checkpoints = [];
  this.current = initial;
  this.current.time = 0;
  this.maxTime = 0;
  this.timers = [];
};

State.prototype.schedule = function (time, callback) {
  this.timers.push({time: time, callback: callback});
};

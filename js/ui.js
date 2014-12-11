var UI = function (state, viz) {
  this.state = state;
  this.viz = viz;

  var gui = new dat.GUI();
  gui.add(this, 'addNode');
  gui.add(this, 'addDisconnectedNode');
  gui.add(this, 'addTrust');
};

UI.prototype.addNode = function () {
  var _this = this;
  var newNode = {
    id: this.state.current.nodes.length,
    advisors: _.clone(this.state.current.nodes)
  };
  this.state.current.nodes.push(newNode);
  this.state.emit('change');
};

UI.prototype.addDisconnectedNode = function () {
  var _this = this;
  var newNode = {id: this.state.current.nodes.length};
  this.state.current.nodes.push(newNode);
  this.state.emit('change');
};

UI.prototype.addTrust = function () {
  var _this = this;
  // TODO Unregister any existing nodeClick handlers
  this.viz.once('nodeClick', function (node) {
    var firstNode = node;

    _this.viz.once('nodeClick', function (node) {
      var secondNode = node;

      // Can't connect a node to itself
      if (firstNode === secondNode) return;

      // Ignore if already connected
      if (Array.isArray(firstNode.advisors) &&
          !!~firstNode.advisors.indexOf(secondNode)) return;

      firstNode.advisors = firstNode.advisors || [];
      firstNode.advisors.push(secondNode);
      this.state.emit('change');
    })
  })
};

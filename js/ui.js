var UI = function (state, viz) {
  this.state = state;
  this.viz = viz;

  var gui = new dat.GUI();
  gui.add(this, 'addNode');
  gui.add(this, 'addDisconnectedNode');
  gui.add(this, 'addTrust');
  gui.add(this, 'deleteNode');
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

  // Unregister any existing nodeClick handlers
  this.viz.removeAllListeners('nodeClick');

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

UI.prototype.deleteNode = function () {
  var _this = this;

  // Unregister any existing nodeClick handlers
  this.viz.removeAllListeners('nodeClick');

  this.viz.once('nodeClick', function (removedNode) {
    var nodeId = _this.state.current.nodes.indexOf(removedNode);
    _this.state.current.nodes.splice(nodeId, 1);
    _this.state.current.nodes.forEach(function (node) {
      if (!Array.isArray(node.advisors)) return;

      node.advisors.filter(function (advisor) {
        return advisor !== removedNode;
      });
    });
    this.state.emit('change');
  });
};

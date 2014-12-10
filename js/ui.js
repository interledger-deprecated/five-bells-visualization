var UI = function (state, viz) {
  this.state = state;
  this.viz = viz;

  var gui = new dat.GUI();
  gui.add(this, 'addNode');
  gui.add(this, 'addDisconnectedNode');
};

UI.prototype.addNode = function () {
  var _this = this;
  var newNode = {id: this.state.current.nodes.length};
  this.state.current.nodes.push(newNode);
  this.state.current.nodes.forEach(function (node) {
    if (newNode !== node) {
      _this.state.current.links.push({source: newNode, target: node, hi: true});
    }
  });
  this.state.emit('change');
};

UI.prototype.addDisconnectedNode = function () {
  var _this = this;
  var newNode = {id: this.state.current.nodes.length};
  this.state.current.nodes.push(newNode);
  this.state.emit('change');
};

UI.prototype.addTrust = function () {
  this.viz.once('nodeClick', function (node) {
    var firstNode = node;
  })
};

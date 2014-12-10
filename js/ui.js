var UI = function (state) {
  this.state = state;

  var gui = new dat.GUI();
  gui.add(this, 'addNode');
  gui.add(this, 'addDisconnectedNode');
};

UI.prototype.addNode = function () {
  var _this = this;
  var id = this.state.current.nodes.length;
  var newNode = {id: id};
  this.state.current.nodes.push(newNode);
  this.state.current.nodes.forEach(function (node) {
    if (id !== node.id) {
      _this.state.current.links.push({source: newNode, target: node, hi: true});
    }
  });
  this.state.emit('change');
};

UI.prototype.addDisconnectedNode = function () {
  var _this = this;
  var id = this.state.current.nodes.length;
  var newNode = {id: id};
  this.state.current.nodes.push(newNode);
  this.state.emit('change');
};

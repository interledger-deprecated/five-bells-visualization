export default class UI {
  constructor(state, viz) {
    this.state = state;
    this.viz = viz;

    const gui = new dat.GUI();
    gui.add(this, 'addNode');
    gui.add(this, 'addDisconnectedNode');
    gui.add(this, 'addTrust');
    gui.add(this, 'deleteNode');
  }

  addNode() {
    const newNode = {
      id: this.state.current.nodes.length,
      advisors: _.clone(this.state.current.nodes)
    };
    this.state.current.nodes.push(newNode);
    this.state.emit('change');
  }

  addDisconnectedNode() {
    const newNode = {id: this.state.current.nodes.length};
    this.state.current.nodes.push(newNode);
    this.state.emit('change');
  }

  addTrust() {
    // Unregister any existing nodeClick handlers
    this.viz.removeAllListeners('nodeClick');

    this.viz.once('nodeClick', this.handleTrustFirstClick.bind(this));
  }

  handleTrustFirstClick(firstNode) {
    this.viz.once('nodeClick',
      this.handleTrustSecondClick.bind(this, firstNode));
  }

  handleTrustSecondClick(firstNode, secondNode) {
    // Can't connect a node to itself
    if (firstNode === secondNode) {
      return;
    }

    // Ignore if already connected
    if (Array.isArray(firstNode.advisors) &&
        !!~firstNode.advisors.indexOf(secondNode)) {
      return;
    }

    firstNode.advisors = firstNode.advisors || [];
    firstNode.advisors.push(secondNode);
    this.state.emit('change');
  }

  deleteNode() {
    // Unregister any existing nodeClick handlers
    this.viz.removeAllListeners('nodeClick');

    this.viz.once('nodeClick', this.handleDeleteNodeClick.bind(this));
  }

  handleDeleteNodeClick(removedNode) {
    const nodeId = this.state.current.nodes.indexOf(removedNode);
    this.state.current.nodes.splice(nodeId, 1);
    this.state.current.nodes.forEach(function (node) {
      if (!Array.isArray(node.advisors)) {
        return;
      }

      node.advisors.filter(advisor => {
        return advisor !== removedNode;
      });
    });
    this.state.emit('change');
  }
}

var Analyzer = function (state) {
  this.state = state;

  state.on('change', this.update.bind(this));
  this.update();
};

Analyzer.colors = [
  '#60BD68', // green
  '#FAA43A', // orange
  '#5DA5DA', // blue
  '#F17CB0', // pink
  '#B2912F', // brown
  '#B276B2', // purple
  '#DECF3F', // yellow
  '#F15854', // red
  '#4D4D4D', // gray
];

Analyzer.prototype.update = function () {
  // Convert to adjacency list
  // TODO May be more efficient to rewrite the Tarjan's algorithm
  //      to expect a list in the format that we actually use.
  var adjList = this.state.current.nodes.map(function (node) {
    return (node.advisors || []).map(function (node) {
      return this.state.current.nodes.indexOf(node);
    });
  });
  var scc = Graph.stronglyConnectedComponents(adjList);
  scc.components.sort(function (a, b) {
    return a[a.length-1] - b[b.length-1];
  });
  scc.components.forEach(function (component, i) {
    component.forEach(function (nodeId) {
      var node = this.state.current.nodes[nodeId];
      node.color = Analyzer.colors[i % Analyzer.colors.length];
    });
  });
};

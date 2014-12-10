var Analyzer = function (state) {
  this.state = state;

  state.on('change', this.update.bind(this));
  this.update();
};

Analyzer.colors = [
  '#4D4D4D', // gray
  '#5DA5DA', // blue
  '#FAA43A', // orange
  '#60BD68', // green
  '#F17CB0', // pink
  '#B2912F', // brown
  '#B276B2', // purple
  '#DECF3F', // yellow
  '#F15854', // red
];

Analyzer.prototype.update = function () {
  this.state.current.nodes.forEach(function (node, i) {
    node.color = Analyzer.colors[i % Analyzer.colors.length];
  });
};

jQuery(function ($) {
  var width = $(document).width();
  var height = $(document).height();

  var initialNodes = [
    { id: 0, x: width/2 - 61.1, y: height/2 - 61.1, quorum: 3, fixed: true },
    { id: 1, x: width/2 + 61.1, y: height/2 - 61.1, quorum: 3, fixed: true },
    { id: 2, x: width/2 - 61.1, y: height/2 + 61.1, quorum: 3, fixed: true },
    { id: 3, x: width/2 + 61.1, y: height/2 + 61.1, quorum: 3, fixed: true }
  ];

  util.interconnectFully(initialNodes);

  var state = window.state = new State({
    nodes: initialNodes,
    messages: []
  });

  // We need to create the analyzer before the visualization, so that things
  // update in the correct order.
  var analyzer = window.analyzer = new Analyzer(state);

  var viz = window.viz = new Visualization(state);
  viz.setup();

  var ui = window.ui = new UI(state, viz);
});

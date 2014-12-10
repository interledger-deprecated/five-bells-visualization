jQuery(function ($) {
  var width = $(document).width();
  var height = $(document).height();

  var initialNodes = [
    { id: 0, x: width/2 - 100, y: height/2 - 100, quorum: 3 },
    { id: 1, x: width/2 + 100, y: height/2 - 100, quorum: 3 },
    { id: 2, x: width/2 - 100, y: height/2 + 100, quorum: 3 },
    { id: 3, x: width/2 + 100, y: height/2 + 100, quorum: 3 }
  ];

  util.interconnectFully(initialNodes);

  var initialLinks = util.generateLinks(initialNodes);
  console.log(initialLinks);

  var state = window.state = new State({
    nodes: initialNodes,
    links: initialLinks,
    messages: []
  });

  // We need to create the analyzer before the visualization, so that things
  // update in the correct order.
  var analyzer = window.analyzer = new Analyzer(state);

  var viz = window.viz = new Visualization(state);
  viz.setup();

  var ui = window.ui = new UI(state, viz);
});

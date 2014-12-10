jQuery(function ($) {
  var width = $(document).width();
  var height = $(document).height();

  var initialNodes = [
    { id: 0, x: width/2 - 100, y: height/2 - 100 },
    { id: 1, x: width/2 - 100, y: height/2 + 100 },
    { id: 2, x: width/2 + 100, y: height/2 - 100 },
    { id: 3, x: width/2 + 100, y: height/2 + 100 }
  ];

  var initialLinks = [
    { source: initialNodes[0], target: initialNodes[1], hi: true, lo: true },
    { source: initialNodes[0], target: initialNodes[2], hi: true, lo: true },
    { source: initialNodes[0], target: initialNodes[3], hi: true, lo: true },
    { source: initialNodes[1], target: initialNodes[2], hi: true, lo: true },
    { source: initialNodes[1], target: initialNodes[3], hi: true, lo: true },
    { source: initialNodes[2], target: initialNodes[3], hi: true, lo: true },
  ];

  var state = window.state = new State({
    nodes: initialNodes,
    links: initialLinks,
    messages: []
  });

  var viz = window.viz = new Visualization(state);
  viz.setup();

  var ui = window.ui = new UI(viz);
});

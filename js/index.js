import Ripple from 'js/ripple';

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

  var ripple = window.ripple = new Ripple();

  state.updater = function (state) {
    return ripple.update(state.current);
  };

  // We need to create the analyzer before the visualization, so that things
  // update in the correct order.
  var analyzer = window.analyzer = new Analyzer(state);

  var viz = window.viz = new Visualization(state);
  viz.setup();

  var ui = window.ui = new UI(state, viz);

  var last = null;
  var step = function(timestamp) {
    // if (!playback.isPaused() && last !== null && timestamp - last < 500) {
      var wallMicrosElapsed = (timestamp - last) * 1000;
      var speed = 100;
      var modelMicrosElapsed = wallMicrosElapsed / speed;
      var modelMicros = state.current.time + modelMicrosElapsed;
      state.seek(modelMicros);
      // if (modelMicros >= state.getMaxTime() && onReplayDone !== undefined) {
      //   var f = onReplayDone;
      //   onReplayDone = undefined;
      //   f();
      // }
    // }
    last = timestamp;
    window.requestAnimationFrame(step);
  };
  window.requestAnimationFrame(step);
});

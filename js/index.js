import Ripple from 'js/ripple';
import { interconnectFully } from 'js/util';
import UI from 'js/ui';
import State from 'js/state';
import Analyzer from 'js/analyzer';
import Visualization from 'js/visualization';

jQuery(function ($) {
  let width = $(document).width();
  let height = $(document).height();

  const initialNodes = [
    {id: 0, x: width / 2 - 61.1, y: height / 2 - 61.1, quorum: 3, fixed: true},
    {id: 1, x: width / 2 + 61.1, y: height / 2 - 61.1, quorum: 3, fixed: true},
    {id: 2, x: width / 2 - 61.1, y: height / 2 + 61.1, quorum: 3, fixed: true},
    {id: 3, x: width / 2 + 61.1, y: height / 2 + 61.1, quorum: 3, fixed: true}
  ];

  interconnectFully(initialNodes);

  const state = window.state = new State({
    nodes: initialNodes,
    messages: []
  });

  const ripple = window.ripple = new Ripple();

  state.updater = function () {
    return ripple.update(this.current);
  };

  // We need to create the analyzer before the visualization, so that things
  // update in the correct order.
  window.analyzer = new Analyzer(state);

  const viz = window.viz = new Visualization(state);
  viz.setup();

  window.ui = new UI(state, viz);

  let last = null;
  function step(timestamp) {
    // if (!playback.isPaused() && last !== null && timestamp - last < 500) {
    let wallMicrosElapsed = (timestamp - last) * 1000;
    let speed = 100;
    let modelMicrosElapsed = wallMicrosElapsed / speed;
    let modelMicros = state.current.time + modelMicrosElapsed;
    state.seek(modelMicros);
    // if (modelMicros >= state.getMaxTime() && onReplayDone !== undefined) {
    //   var f = onReplayDone;
    //   onReplayDone = undefined;
    //   f();
    // }
    // }
    last = timestamp;
    window.requestAnimationFrame(step);
  }
  window.requestAnimationFrame(step);
});

import Ripple from 'src/js/client/ripple';
import { interconnectFully } from 'src/js/client/util';
import UI from 'src/js/client/ui';
import State from 'src/js/client/state';
import Analyzer from 'src/js/client/analyzer';
import Visualization from 'src/js/client/visualization';
import Parser from 'src/js/client/parser';

jQuery(function () {
  const state = window.state = new State({
    nodes: [],
    messages: []
  });

  const ripple = window.ripple = new Ripple();

  state.updater = function () {
    return ripple.update(this.current);
  };

  // We need to create the analyzer before the visualization, so that things
  // update in the correct order.
  // window.analyzer = new Analyzer(state);

  const viz = window.viz = new Visualization(state);
  viz.setup();

  window.ui = new UI(state, viz);

  const parser = window.parser = new Parser(state);

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

  // Get log stream from server
  const socket = io();
  socket.on('connect', function () {
    console.log('socket.io connected');
  });
  socket.on('line', function (line) {
    parser.parseLine(line);
  });
});

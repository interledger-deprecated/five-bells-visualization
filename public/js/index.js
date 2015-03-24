import Ripple from 'js/ripple';
import { interconnectFully } from 'js/util';
import UI from 'js/ui';
import State from 'js/state';
import Analyzer from 'js/analyzer';
import Visualization from 'js/visualization';
import Parser from 'js/parser';

jQuery(function () {
  const state = window.state = new State({
    nodes: [],
    messages: [],
    events: new Set()
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

  const parser = window.parser = new Parser(state);

  const ui = window.ui = new UI(state, viz, parser);

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

  function processEvent(event) {
    console.log(new Date, event.detail.resource && event.detail.resource.id);
    parser.parseEvent(event);
    viz.tick();
    viz.start();
  }

  const queue = [];
  let queueTimer = null;
  function processQueue() {
    if (queueTimer) {
      return;
    }

    if (!ui.rateLimit) {
      do {
        if (queue.length) {
          processEvent(queue.shift());
        }
      } while (queue.length);
    } else if (queue.length) {
      processEvent(queue.shift());
      queueTimer = setTimeout(() => {
        queueTimer = null;
        processQueue();
      }, 1000);
    }
  }

  function queueEvent(event) {
    queue.push(event);
    processQueue();
  }

  // Get log stream from server
  const socket = io();
  socket.on('connect', function () {
    console.log('socket.io connected');
  });
  socket.on('event', function (event) {
    console.log(event);
    queueEvent(event);
  });
});

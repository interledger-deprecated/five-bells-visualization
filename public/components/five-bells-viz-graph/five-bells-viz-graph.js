import Ripple from 'js/ripple';
import { interconnectFully } from 'js/util';
import UI from 'js/ui';
import State from 'js/state';
import Analyzer from 'js/analyzer';
import Visualization from 'js/visualization';
import Parser from 'js/parser';

Polymer('five-bells-viz-graph', {
  ready: function () {
    const state = this.state = window.state = new State({
      nodes: [],
      messages: [],
      events: new Set()
    });

    const ripple = this.ripple = window.ripple = new Ripple();

    state.updater = function () {
      return ripple.update(this.current);
    };

    // We need to create the analyzer before the visualization, so that things
    // update in the correct order.
    // window.analyzer = new Analyzer(state);

    const viz = this.viz = window.viz = new Visualization(state);
    viz.setup();

    const parser = this.parser = window.parser = new Parser(state);

    const ui = this.ui = window.ui = new UI(state, viz, parser);

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

    this.queue = [];
    this.queueTimer = null;
  },

  processEvent: function(event) {
    console.log(new Date(), event.detail.resource && event.detail.resource.id);
    this.parser.parseEvent(event);
    this.viz.tick();
    this.viz.start();
  },

  processQueue: function() {
    if (this.queueTimer) {
      return;
    }

    if (!this.ui.rateLimit) {
      do {
        if (this.queue.length) {
          this.processEvent(this.queue.shift());
        }
      } while (this.queue.length);
    } else if (this.queue.length) {
      this.processEvent(this.queue.shift());
      this.queueTimer = setTimeout(() => {
        this.queueTimer = null;
        this.processQueue();
      }, 1000);
    }
  },

  queueEvent: function(event) {
    this.queue.push(event);
    this.processQueue();
  },

  // Clear is triggered on reconnect, so we can start from a clean slate
  handleGraphClear: function () {
    // Cancel any currently queued events
    this.queue = [];
    //   // Reset the state to the initial setting
    this.state.clear();
    //   // Update the visualization
    this.viz.start();
  },
  handleGraphEvent: function (event) {
    console.log(event.detail.msg);
    this.queueEvent(event.detail.msg);
  }
});

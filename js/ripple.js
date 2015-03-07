import { Network } from 'js/network';

export class Ripple extends Network {
  constructor() {
    super();

    this.proposedSet = [];
    this.state = 'open';
  }

  update(model) {
    super.update(model);

    // Run algorithm rules
    model.nodes.forEach(function (node) {
      if (node.state !== 'sent') {
        model.nodes.forEach(function (otherNode) {
          if (otherNode !== node) {
            _this.sendMessage(model, {source: node, target: otherNode, type: 'ping'});
          }
        });
        node.state = 'sent';
      }
    });
  }

  startConsensus() {

  }
}
// var Ripple = function () {
//   Node.call(this);
// };
//
// Ripple.prototype.startConsensus = function () {
//
// };

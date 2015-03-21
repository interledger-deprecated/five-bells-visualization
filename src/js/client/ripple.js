import Network from 'src/js/client/network';

export default class Ripple extends Network {
  constructor() {
    super();

    this.proposedSet = [];
    this.state = 'open';
  }

  updateStates(model) {
    super.updateStates(model);

    // Run algorithm rules
    model.nodes.forEach(node => {
      if (node.state !== 'sent') {
        this.broadcastMessage(model, node, {
          type: 'ping'
        });
        node.state = 'sent';
      }
    });
  }

  startConsensus() {

  }
}

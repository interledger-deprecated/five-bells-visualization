
let unique = 0;
export default class Parser {
  constructor(state) {
    this.state = state;
    this.nodes = new Map();
    this.links = new Map();
  }

  parseEvent(event) {
    switch (event.type) {
      case 'ledger':
        this.parseLedgerEvent(event);
        break;
      case 'trader':
        this.parseTraderEvent(event);
        break;
      case 'user':
        this.parseUserEvent(event);
        break;
    }
  }

  parseLedgerEvent(event) {
    if (this.nodes.has(event.detail.id)) {
      return;
    }

    const node = {
      id: unique++,
      type: 'ledger',
      identity: event.detail.id
    };
    this.nodes.set(event.detail.id, node);
    this.state.current.nodes.push(node);
  }

  parseTraderEvent(event) {
    const nodeId = event.detail.source + ';' + event.detail.destination;
    if (this.links.has(nodeId)) {
      return;
    }

    const node = {
      id: unique++,
      type: 'trader',
      identity: nodeId,
      source: event.detail.source,
      target: event.detail.destination
    };
    this.nodes.set(nodeId, node);
    this.state.current.nodes.push(node);
  }

  parseUserEvent(event) {
    if (this.nodes.has(event.detail.id)) {
      return;
    }

    const node = {
      id: unique++,
      type: 'user',
      identity: event.detail.id,
      ledger: event.detail.ledger
    };
    this.nodes.set(event.detail.id, node);
    this.state.current.nodes.push(node);
  }
}

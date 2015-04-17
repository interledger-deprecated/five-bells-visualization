
let unique = 0;
export default class Parser {
  constructor(state) {
    this.state = state;
    this.nodes = new Map();
    this.events = new Map();
    this.eventsBySettlement = new Map();
    this.queue = [];
    this.queueTimer = null;
  }

  receiveEvent(event) {
    event.id = seq++;
    this.queue.push(event);
    this.processQueue();
  }

  processQueue() {
  }

  getNode(nodeId) {
    return this.nodes.get(nodeId);
  }

  getEventsBySettlement(settlementId) {
    return this.eventsBySettlement.get(settlementId);
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
      case 'notification':
        this.parseNotificationEvent(event);
        break;
      default:
        // console.log('Unknown event', event);
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
    const nodeId = (event.detail.source < event.detail.destination) ?
      event.detail.source + ';' + event.detail.destination :
      event.detail.destination + ';' + event.detail.source;

    if (this.nodes.has(nodeId)) {
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
    this.state.current.traders.push(node);
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

  parseNotificationEvent(event) {
    let notification;
    if (this.events.has(event.detail.resource.id)) {
      notification = this.events.get(event.detail.resource.id);
    } else {
      notification = {
        id: unique++,
        related: this.nodes.get(event.detail.host),
        text: event.detail.resource.state,
        state: event.detail.resource.state,
        offsetX: 0,
        offsetY: -20
      };
      this.events.set(event.detail.resource.id, notification);
      this.state.current.events.add(notification);
    }

    let settlementEvents, settlementId = event.detail.resource.partOfSettlement;
    if (this.eventsBySettlement.has(settlementId)) {
      settlementEvents = this.eventsBySettlement.get(settlementId);
    } else {
      settlementEvents = new Set();
      this.eventsBySettlement.set(settlementId, settlementEvents);
    }
    settlementEvents.add(event);

    notification.text = event.detail.resource.state;
    notification.state = event.detail.resource.state;

    if (event.detail.resource.state === 'completed') {
      this.state.current.events.delete(notification);
    }
  }
}

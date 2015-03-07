var MIN_RPC_LATENCY = 10000;
var MAX_RPC_LATENCY = 15000;

var unique = 0;

export class Network {
  update(model) {
    var _this = this;

    var dirty = false;

    var previousLength = model.messages.length;

    // Detect if any new messages were sent
    dirty = dirty || model.messages.length !== previousLength;

    var deliver = [];
    var keep = [];
    model.messages.forEach(function (message) {
      if (message.recvTime <= model.time) {
        deliver.push(message);
      } else {
        keep.push(message);
      }
    });

    // Detect if any messages were handled
    dirty = dirty || deliver.length;

    model.messages = keep;

    // Handle messages to be delivered
    deliver.forEach(function (message) {
      _this.handleMessage(model, message);
    });

    return dirty;
  }

  sendMessage(model, message) {
    message.id = "message" + unique++;
    message.sendTime = model.time;
    message.recvTime = model.time +
                       MIN_RPC_LATENCY +
                       Math.random() * (MAX_RPC_LATENCY - MIN_RPC_LATENCY);
    model.messages.push(message);
  }

  handleMessage(model, message) {
    if (message.type === 'ping') {
      this.sendMessage(model, {source: message.target, target: message.source, type: 'pong'});
    }
  }

  broadcastMessage(model, node, message) {
    model.nodes.forEach(function (otherNode) {
      if (otherNode !== node) {
        var msg = _.cloneDeep(message);
        msg.source = node;
        msg.target = otherNode;
        _this.sendMessage(model, msg);
      }
    });
  }
}

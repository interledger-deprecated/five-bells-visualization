'use strict';

const config = require('../services/config');
const log = require('five-bells-shared/services/log')('quote');
const pathfinder = require('../services/pathfinder');
const orchestrator = require('../services/orchestrator');

function formatAmount (amount) {
  if (typeof amount === 'string') {
    amount = parseFloat(amount);
  }
  return amount.toFixed(2);
}

exports.get = function *() {
  // TODO: Sanitize this.query

  let source = this.query.source_asset + '/' + this.query.source_ledger;
  let destination = this.query.destination_asset + '/' +
    this.query.destination_ledger;
  let path = pathfinder.findPath(source, destination);

  let settlements;
  if (this.query.source_amount) {
    log.debug('creating quote with fixed source amount');
    // XXX
    throw new Error('not implemented');
  } else if (this.query.destination_amount) {
    log.debug('creating quote with fixed destination amount');
    settlements = yield orchestrator.quotePathFromDestination(this.query, path);
  } else {
    // XXX
    throw new Error();
  }

  this.body = {
    source_transfer: settlements[0].source_transfer,
    destination_transfer: settlements.pop().destination_transfer
  };
};

'use strict';

const config = require('../services/config');
const log = require('five-bells-shared/services/log')('quote');
const pathfinder = require('../services/pathfinder');

function formatAmount (amount) {
  if (typeof amount === 'string') {
    amount = parseFloat(amount);
  }
  return amount.toFixed(2);
}

exports.get = function *() {
  let path = pathfinder.findPath(this.query.source_ledger,
                                 this.query.destination_ledger);

  this.body = path;

  let sourceAmount, destinationAmount;
  if (this.query.source_amount) {
    log.debug('creating quote with fixed source amount');
    sourceAmount = formatAmount(this.query.source_amount);
    destinationAmount = formatAmount(this.query.source_amount);
  } else if (this.query.destination_amount) {
    log.debug('creating quote with fixed destination amount');
    sourceAmount = formatAmount(this.query.destination_amount);
    destinationAmount = formatAmount(this.query.destination_amount);
  } else {
    // XXX
    throw new Error();
  }

  let source_transfer = {
    credits: [{
      ledger: this.query.source_ledger,
      asset: this.query.source_asset,
      amount: sourceAmount,
      account: config.id
    }]
  };

  let destination_transfer = {
    debits: [{
      account: config.id,
      ledger: this.query.destination_ledger,
      asset: this.query.destination_asset,
      amount: destinationAmount
    }]
  };

  this.body = {
    source_transfer: source_transfer,
    destination_transfer: destination_transfer
  };
};

'use strict';

const log = require('@ripple/five-bells-shared/services/log')('orchestrator');

const request = require('co-request');
const uuid = require('uuid4');

function Orchestrator(crawler) {
  const self = this;

  this.crawler = crawler;
  this.pairs = {};

  crawler.on('pair', function *(pair) {
    self.handleTradingPair(pair);
  });
}

Orchestrator.prototype.handleTradingPair = function(pair) {
  this.pairs[pair.source + ';' + pair.destination] = pair.uri;
};

Orchestrator.prototype.quotePathFromDestination = function *(params, path) {
  path = path.slice();

  let destination = path.pop(),
      destination_amount = params.destination_amount,
      payments = [];

  while (path.length) {
    let source = path.pop();
    let trader = this.pairs[source + ';' + destination];

    let query = {
      source_ledger: source,
      destination_ledger: destination,
      destination_amount: destination_amount
    };

    log.info('quoting hop', source, '=>', destination, '(via ' + trader + ')');
    let payment = yield this.getQuote(trader, query);
    payment.id = trader + '/payments/' + uuid();

    payments.unshift(payment);
    destination = source;
    destination_amount = payment.source_transfers[0].credits[0].amount;
  }

  return payments;
};

/**
 * Get a quote from a trader.
 *
 * quoteOpts should include:
 *  source_ledger
 *  source_asset
 *  destination_ledger
 *  destination_asset
 *  destination_amount or source_amount
 */
Orchestrator.prototype.getQuote = function *getQuote(trader, quoteOpts) {
  let req = yield request({
    uri: trader + '/quote',
    qs: quoteOpts,
    json: true
  });

  if (req.statusCode >= 400) {
    throw new Error('Server Error: ' + req.statusCode + ' ' + req.body);
  }

  return req.body;
};

exports.Orchestrator = Orchestrator;

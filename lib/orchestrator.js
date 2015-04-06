'use strict';

const log = require('five-bells-shared/services/log')('orchestrator');

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
  let destination = path.pop(),
      destination_amount = params.destination_amount,
      settlements = [];

  while (path.length) {
    let source = path.pop();
    let trader = this.pairs[source + ';' + destination];
    console.log('assoc', source, destination, trader);
    let query = {
      source_asset: source.split('/')[0],
      source_ledger: source.split('/').slice(1).join('/'),
      destination_asset: destination.split('/')[0],
      destination_ledger: destination.split('/').slice(1).join('/'),
      destination_amount: destination_amount
    };

    let settlement = yield this.getQuote(trader, query);
    settlement.id = 'http://' + trader + '/settlements/' + uuid();

    log.info('quoting hop', source, '=>', destination, '(via ' + trader + ')');
    settlements.unshift(settlement);
    destination = source;
    destination_amount = settlement.source_transfer.credits[0].amount;
  }

  return settlements;
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
    uri: 'http://' + trader + '/quote',
    qs: quoteOpts,
    json: true
  });

  if (req.statusCode >= 400) {
    throw new Error('Server Error: ' + req.statusCode + ' ' + req.body);
  }

  return req.body;
};

exports.Orchestrator = Orchestrator;

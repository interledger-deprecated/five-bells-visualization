'use strict';

const requestUtil = require('five-bells-shared/utils/request');
const log = require('five-bells-shared/services/log')('settlements');
const pathfinder = require('../services/pathfinder');

exports.put = function *(id) {
  requestUtil.validateUriParameter('id', id, 'Uuid');
  let settlement = yield requestUtil.validateBody(this, 'Settlement');

  if (typeof settlement.id !== 'undefined') {
    requestUtil.assert.strictEqual(
      settlement.id,
      requestUtil.getBaseUri(this) + this.originalUrl,
      'Settlement ID must match the one in the URL'
    );
  }

  settlement.id = id;

  log.debug('received settlement ID ' + settlement.id);

  let path = pathfinder.findPath(settlement.source_transfer.debits[0].ledger,
    settlement.destination_transfer.debits[0].ledger);

  console.log(settlement);
  console.log(path);
};

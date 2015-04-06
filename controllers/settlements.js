'use strict';

const crypto = require('crypto');
const requestUtil = require('five-bells-shared/utils/request');
const log = require('five-bells-shared/services/log')('settlements');
const pathfinder = require('../services/pathfinder');
const orchestrator = require('../services/orchestrator');
const config = require('../services/config');
const uuid = require('uuid4');
const request = require('co-request');
const emitter = require('co-emitter');

function hashJSON(json) {
  let str = JSON.stringify(json);
  let hash = crypto.createHash('sha512').update(str).digest('base64');
  return hash;
}

exports.put = function *(id) {
  requestUtil.validateUriParameter('id', id, 'Uuid');
  let settlement = yield requestUtil.validateBody(this, 'Settlement');

  const settlementUri = config.server.base_uri + '/settlements/' + id;
  if (typeof settlement.id !== 'undefined') {
    requestUtil.assert.strictEqual(
      settlement.id,
      settlementUri,
      'Settlement ID must match the one in the URL'
    );
  }

  settlement.id = id;

  log.debug('received settlement ID ' + settlement.id);

  let query = {
    source_ledger: settlement.source_transfer.credits[0].ledger,
    source_asset: settlement.source_transfer.credits[0].asset,
    destination_ledger: settlement.destination_transfer.debits[0].ledger,
    destination_asset: settlement.destination_transfer.debits[0].asset,
    destination_amount: settlement.destination_transfer.debits[0].amount
  };

  let source = query.source_asset + '/' + query.source_ledger;
  let destination = query.destination_asset + '/' + query.destination_ledger;
  let path = pathfinder.findPath(source, destination);

  let settlements;
  if (query.source_amount) {
    log.debug('creating settlement with fixed source amount');
    // XXX
    throw new Error('not implemented');
  } else if (query.destination_amount) {
    log.debug('creating settlement with fixed destination amount');
    settlements = yield orchestrator.quotePathFromDestination(query, path);
  } else {
    // XXX
    throw new Error();
  }

  // Add start and endpoints in settlement chain from user-provided settlement
  // object
  settlements[0].source_transfer.debits = settlement.source_transfer.debits;
  settlements[settlements.length - 1].destination_transfer.credits =
    settlement.destination_transfer.credits;

  // Fill in remaining transfers data
  settlements.reduce(function (left, right) {
    left.destination_transfer.credits = right.source_transfer.credits;
    right.source_transfer.debits = left.destination_transfer.debits;
    return left;
  });

  // Create final (rightmost) transfer
  let finalTransfer = settlements[settlements.length - 1].destination_transfer;
  finalTransfer.id = 'http://' + query.destination_ledger + '/transfers/' +
    uuid();
  finalTransfer.partOfSettlement = settlementUri;

  log.info('creating final transfer ' + finalTransfer.id);
  let finalTransferReq = yield request({
    method: 'put',
    uri: finalTransfer.id,
    body: finalTransfer,
    json: true
  });
  if (finalTransferReq.statusCode >= 400) {
    log.error('Server Error:', finalTransferReq.statusCode,
      finalTransferReq.body);
    throw new Error('Remote error');
  }

  // Execution condition is the final transfer in the chain
  let executionCondition = {
    messageHash: hashJSON({
      id: finalTransfer.id,
      state: 'completed'
    }),
    signer: query.destination_ledger
  };

  // Prepare remaining transfer objects
  let transfers = [];
  for (let i = settlements.length - 1; i >= 0; i--) {
    let transfer = settlements[i].source_transfer;
    transfer.id = 'http://' + transfer.debits[0].ledger + '/transfers/' +
      uuid();
    transfer.execution_condition = executionCondition;
    transfer.partOfSettlement = settlementUri;
    transfers.unshift(transfer);
  }

  // The first transfer must be submitted by us with authorization
  // TODO: This must be a genuine authorization from the user
  transfers[0].debits[0].authorization = {
    algorithm: 'ed25519-sha512'
  };

  // TODO Theoretically we'd need to keep track of the signed responses
  for (let transfer of transfers) {
    log.info('creating transfer ' + transfer.id);

    let transferReq = yield request({
      method: 'put',
      uri: transfer.id,
      body: transfer,
      json: true
    });
    if (transferReq.statusCode >= 400) {
      log.error('Server Error:', transferReq.statusCode, transferReq.body);
      throw new Error('Remote error');
    }
  }

  transfers.push(finalTransfer);

  for (let i = 0; i < settlements.length; i++) {
    let settlement = settlements[i];
    settlement.source_transfer = transfers[i];
    settlement.destination_transfer = transfers[i + 1];

    let settlementReq = yield request({
      method: 'put',
      uri: settlement.id,
      body: settlement,
      json: true
    });
    if (settlementReq.statusCode >= 400) {
      log.error('Server Error:', settlementReq.statusCode, settlementReq.body);
      throw new Error('Remote error');
    }

    // Add the authorization received from the trader
    // TODO Should be getting this from the trader response?
    transfers[i + 1].debits[0].authorization = {
      algorithm: 'ed25519-sha512'
    };
  }

  // console.log(JSON.stringify(settlements, null, 2));
  // console.log(JSON.stringify(transfers, null, 2));

  // Externally we want to use full URIs as IDs
  settlement.id = settlementUri;

  exports.emit('settlement', settlement);

  this.body = settlement;
};

emitter(exports);

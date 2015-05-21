'use strict';

const crypto = require('crypto');
const requestUtil = require('@ripple/five-bells-shared/utils/request');
const log = require('@ripple/five-bells-shared/services/log')('settlements');
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
    source_ledger: settlement.source_transfers[0].ledger,
    destination_ledger: settlement.destination_transfers[0].ledger,
    destination_amount: settlement.destination_transfers[0].debits[0].amount
  };

  let source = query.source_ledger;
  let destination = query.destination_ledger;
  let path = settlement.path = pathfinder.findPath(source, destination);

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
  settlements[0].source_transfers[0].debits = settlement.source_transfers[0].debits;
  settlements[settlements.length - 1].destination_transfers[0].credits =
    settlement.destination_transfers[0].credits;

  // Fill in remaining transfers data
  settlements.reduce(function (left, right) {
    left.destination_transfers[0].credits = right.source_transfers[0].credits;
    right.source_transfers[0].debits = left.destination_transfers[0].debits;
    return right;
  });

  // Create final (rightmost) transfer
  let finalTransfer = settlements[settlements.length - 1].destination_transfers[0];
  finalTransfer.id = query.destination_ledger + '/transfers/' + uuid();
  finalTransfer.partOfSettlement = settlementUri;
  let expiryDate = new Date((new Date()) + finalTransfer.expiry_duration * 1000);
  finalTransfer.expires_at = expiryDate.toISOString();
  delete finalTransfer.expiry_duration;

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

  let finalTransferStateReq = yield request({
    method: 'get',
    uri: finalTransfer.id + '/state',
    json: true
  });
  if (finalTransferStateReq.statusCode >= 400) {
    log.error('Server Error:', finalTransferStateReq.statusCode,
      finalTransferStateReq.body);
    throw new Error('Remote error');
  }

  // Execution condition is the final transfer in the chain
  let executionCondition = {
    message_hash: hashJSON({
      id: finalTransfer.id,
      state: 'executed'
    }),
    signer: query.destination_ledger,
    public_key: finalTransferStateReq.body.public_key,
    algorithm: finalTransferStateReq.body.algorithm
  };

  // Prepare remaining transfer objects
  let transfers = [];
  for (let i = settlements.length - 1; i >= 0; i--) {
    let transfer = settlements[i].source_transfers[0];
    transfer.id = transfer.ledger + '/transfers/' + uuid();
    transfer.execution_condition = executionCondition;
    transfer.part_of_settlement = settlementUri;
    let expiryDate = new Date((new Date()) + transfer.expiry_duration * 1000);
    transfer.expires_at = expiryDate.toISOString();
    delete transfer.expiry_duration;
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

    // Update transfer state
    // TODO: Also keep copy of state signature
    transfer.state = transferReq.body.state;
  }

  transfers.push(finalTransfer);

  for (let i = 0; i < settlements.length; i++) {
    let settlement = settlements[i];
    settlement.source_transfers = [transfers[i]];
    settlement.destination_transfers = [transfers[i + 1]];

    log.info('creating settlement ' + settlement.id);

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

    transfers[i + 1] = settlementReq.body.destination_transfers[0];
  }

  // console.log(JSON.stringify(settlements, null, 2));
  // console.log(JSON.stringify(transfers, null, 2));

  // Externally we want to use full URIs as IDs
  settlement.id = settlementUri;

  exports.emit('settlement', settlement);

  this.body = settlement;
};

emitter(exports);

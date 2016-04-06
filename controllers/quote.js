'use strict'

const log = require('../services/log')('quote')
const pathfinder = require('../services/pathfinder')

exports.get = function * () {
  // TODO: Sanitize this.query

  let source = this.query.source_ledger
  let destination = this.query.destination_ledger

  let payments
  if (this.query.source_amount) {
    log.debug('creating quote with fixed source amount')
    // XXX
    throw new Error('not implemented')
  } else if (this.query.destination_amount) {
    log.debug('creating quote with fixed destination amount')
    payments = yield pathfinder.findPath({
      sourceLedger: source,
      destinationLedger: destination,
      destinationAmount: this.query.destination_amount
    })
  } else {
    // XXX
    throw new Error()
  }

  this.body = {
    source_transfers: [payments[0].source_transfers[0]],
    destination_transfers: [payments.pop().destination_transfers[0]]
  }
}

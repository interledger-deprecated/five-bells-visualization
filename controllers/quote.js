'use strict'

const log = require('../services/log')('quote')
const pathfinder = require('../services/pathfinder')
const orchestrator = require('../services/orchestrator')

exports.get = function *() {
  // TODO: Sanitize this.query

  let source = this.query.source_ledger
  let destination = this.query.destination_ledger
  let path = pathfinder.findPath(source, destination)

  let settlements
  if (this.query.source_amount) {
    log.debug('creating quote with fixed source amount')
    // XXX
    throw new Error('not implemented')
  } else if (this.query.destination_amount) {
    log.debug('creating quote with fixed destination amount')
    settlements = yield orchestrator.quotePathFromDestination(this.query, path)
  } else {
    // XXX
    throw new Error()
  }

  this.body = {
    source_transfers: [settlements[0].source_transfers[0]],
    destination_transfers: [settlements.pop().destination_transfers[0]]
  }
}

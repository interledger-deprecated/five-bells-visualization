'use strict'

const log = require('../services/log')('payments')
const send = require('five-bells-sender').default

exports.put = function * () {
  const body = this.request.body
  const payment_args = {
    sourceAccount: body.source_ledger + '/accounts/' + encodeURIComponent(body.source_username),
    sourcePassword: body.source_password,
    destinationAccount: body.destination_ledger + '/accounts/' + encodeURIComponent(body.destination_username),
    destinationAmount: '1'
  }
  log.debug('put payment:', payment_args)
  yield send(payment_args)
  this.body = payment_args
}

'use strict'

const log = require('../services/log')('payments')
const sender = require('five-bells-sender')

exports.put = function * () {
  const body = this.request.body
  let payment_args = {
    source_ledger: body.source_ledger,
    source_username: body.source_username,
    source_password: body.source_password,
    destination_ledger: body.destination_ledger,
    destination_username: body.destination_username,
    destination_amount: '1'
  }
  log.debug('put payment:', payment_args)
  yield sender(payment_args)
  this.body = payment_args
}

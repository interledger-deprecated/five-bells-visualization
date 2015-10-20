'use strict'

const log = require('../services/log')('payments')
const sender = require('@ripple/five-bells-sender')

exports.put = function * () {
  let payment_args = {
    source_ledger: this.query.source_ledger,
    source_username: this.query.source_user,
    source_password: this.query.source_user,
    destination_ledger: this.query.destination_ledger,
    destination_username: this.query.destination_user,
    destination_amount: '1'
  }
  log.debug('put payment:', payment_args)
  yield sender(payment_args)
  this.body = payment_args
}

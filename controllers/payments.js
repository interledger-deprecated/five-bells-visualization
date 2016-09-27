'use strict'

const log = require('../services/log')('payments')
const ilp = require('ilp')
const FiveBellsLedger = require('ilp-plugin-bells')
const receivers = require('../services/receivers')

exports.put = function * () {
  const body = this.request.body
  const sourceAccountURI = body.source_ledger + '/accounts/' + encodeURIComponent(body.source_username)
  const sender = ilp.createSender({
    _plugin: FiveBellsLedger,
    account: sourceAccountURI,
    password: body.source_password
  })

  const paymentRequest = receivers[body.destination_ledger].createRequest({amount: '1'})
  const paymentParams = yield sender.quoteRequest(paymentRequest)
  log.debug('put payment:', paymentParams)
  const result = yield sender.payRequest(paymentParams)
  this.body = result
}

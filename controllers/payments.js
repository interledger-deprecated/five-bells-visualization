'use strict'

const log = require('../services/log')('payments')
const ilp = require('ilp')
const FiveBellsLedger = require('ilp-plugin-bells')
const receiverSecret = 'O8Y6+6bJgl2i285yCeC/Wigi6P6TJ4C78tdASqDOR9g=' // XXX

exports.put = function * () {
  const body = this.request.body
  const sourceAccountURI = body.source_ledger + '/accounts/' + encodeURIComponent(body.source_username)
  const destinationAccountURI = body.destination_ledger + '/accounts/' + encodeURIComponent(body.destination_username)
  const sender = ilp.createSender({
    _plugin: FiveBellsLedger,
    account: sourceAccountURI,
    password: body.source_password
  })

  const receiver = ilp.createReceiver({
    _plugin: FiveBellsLedger,
    account: destinationAccountURI,
    password: body.destination_password,
    hmacKey: new Buffer(receiverSecret, 'base64')
  })
  yield receiver.listen()

  const paymentRequest = receiver.createRequest({amount: '1'})
  const paymentParams = yield sender.quoteRequest(paymentRequest)
  log.debug('put payment:', paymentParams)
  const result = yield sender.payRequest(paymentParams)
  this.body = result
}

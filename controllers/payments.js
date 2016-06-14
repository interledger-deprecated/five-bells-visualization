'use strict'

const log = require('../services/log')('payments')
const receiver = require('../services/receiver')
const send = require('five-bells-sender').default

exports.put = function * () {
  const body = this.request.body
  const receiverId = String(Math.floor(Math.random() * 0xffffffff))
  const condition = receiver.getConditionForLedger(body.destination_ledger, receiverId)
  const paymentArgs = {
    sourceAccount: body.source_ledger + '/accounts/' + encodeURIComponent(body.source_username),
    sourcePassword: body.source_password,
    destinationAccount: body.destination_ledger + '/accounts/' + encodeURIComponent(body.destination_username),
    destinationAmount: '1',
    receiptCondition: condition.getConditionUri(),
    destinationMemo: { receiverId }
  }
  log.debug('put payment:', paymentArgs)
  yield send(paymentArgs)
  this.body = paymentArgs
}

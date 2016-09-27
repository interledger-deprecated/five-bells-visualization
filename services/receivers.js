'use strict'

const ilp = require('ilp')
const FiveBellsLedger = require('ilp-plugin-bells')
const config = require('./config')
const receivers = {}

for (const ledgerPrefix in config.ledgers) {
  const ledgerHost = config.ledgers[ledgerPrefix]
  receivers[ledgerHost] = ilp.createReceiver({
    _plugin: FiveBellsLedger,
    account: ledgerHost + '/accounts/bob',
    password: 'bob'
  })
}

module.exports = receivers

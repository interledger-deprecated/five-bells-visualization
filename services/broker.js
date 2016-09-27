'use strict'
const log = require('./log')
const crawler = require('./crawler')
const Broker = require('../lib/broker')
const broker = new Broker(log)

;['ledger', 'connector', 'user'].forEach(function (type) {
  crawler.on(type, function * (detail) {
    broker.emit({
      type: type,
      detail: detail
    })
  })
})

module.exports = broker

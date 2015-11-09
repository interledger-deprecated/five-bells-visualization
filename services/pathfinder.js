'use strict'

const pathfind = require('five-bells-pathfind')
const Pathfinder = pathfind.Pathfinder
const Subscriber = require('../lib/subscriber')
const config = require('./config')
const broker = require('./broker')
const log = require('./log')

pathfind.setLogger(log)

const pathfinder = new Pathfinder(config)

;['ledger', 'trader', 'user'].forEach(function (type) {
  pathfinder.crawler.on(type, function *(detail) {
    broker.emit({
      type: type,
      detail: detail
    })
  })
})

/* eslint-disable no-new */
new Subscriber(config.server.base_uri, {
  crawler: pathfinder.crawler,
  log: log,
  config: config
})
/* eslint-enable no-new */

module.exports = pathfinder

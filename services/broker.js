'use strict'
const log = require('./log')
const Broker = require('../lib/broker')
module.exports = new Broker(log)

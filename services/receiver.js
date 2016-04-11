'use strict'
const log = require('./log')
const config = require('./config')
const Receiver = require('../lib/receiver')
module.exports = new Receiver(log, config)

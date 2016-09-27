'use strict'

const config = require('./config')
const log = require('./log')
const crawler = require('./crawler')
const Subscriber = require('../lib/subscriber')

module.exports = new Subscriber({crawler, log, config})

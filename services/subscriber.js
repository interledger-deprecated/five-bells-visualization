'use strict'

const Subscriber = require('../lib/subscriber').Subscriber
const crawler = require('./crawler')

module.exports = new Subscriber(crawler)

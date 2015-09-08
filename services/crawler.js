'use strict'

const Crawler = require('../lib/crawler').Crawler
const config = require('./config')

module.exports = new Crawler(config)

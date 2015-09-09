'use strict'

const Pathfinder = require('../lib/pathfinder').Pathfinder
const crawler = require('./crawler')

module.exports = new Pathfinder(crawler)

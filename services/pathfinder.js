'use strict'

const pathfind = require('@ripple/five-bells-pathfind')
const Pathfinder = pathfind.Pathfinder
const config = require('./config')
const log = require('./log')

pathfind.setLogger(log)

const pathfinder = new Pathfinder(config)
module.exports = pathfinder

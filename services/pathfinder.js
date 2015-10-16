'use strict';

const Pathfinder = require('@ripple/five-bells-pathfind').Pathfinder;
const config = require('./config');

const pathfinder = new Pathfinder(config);

module.exports = pathfinder;

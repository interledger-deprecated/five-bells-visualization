'use strict';

const Orchestrator = require('../lib/orchestrator').Orchestrator;
const crawler = require('./crawler');

module.exports = new Orchestrator(crawler);

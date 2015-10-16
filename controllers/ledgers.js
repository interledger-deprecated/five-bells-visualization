'use strict';

const pathfinder = require('../services/pathfinder');

exports.list = function *() {
  this.body = pathfinder.getLedgers();
};

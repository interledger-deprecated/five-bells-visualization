'use strict';

const crawler = require('../services/crawler');

exports.list = function *() {
  this.body = crawler.getLedgers();
};

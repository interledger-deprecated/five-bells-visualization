'use strict';

const body = require('co-body');

exports.post = function *postNotification() {
  console.log(yield body(this));
};

'use strict'

const parse = require('co-body')
const emitter = require('co-emitter')

exports.post = function * postNotification () {
  const body = yield parse(this)
  exports.emit('notification', body)
  this.status = 204
}

emitter(exports)

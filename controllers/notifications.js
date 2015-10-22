'use strict'

const emitter = require('co-emitter')

exports.post = function * postNotification () {
  const body = this.request.body
  exports.emit('notification', body)
  this.status = 204
}

emitter(exports)

'use strict'
const WebSocket = require('ws')
const request = require('co-request')
const Emitter = require('co-emitter')
const dummyUser = 'visualization'

function Subscriber (options) {
  this.crawler = options.crawler
  this.log = options.log('subscriber')
  this.config = options.config

  const _this = this
  this.crawler.on('ledger', function * (ledger) {
    yield _this.subscribeLedger(ledger)
  })
}

Emitter(Subscriber.prototype)

Subscriber.prototype.subscribeLedger = function * (ledger) {
  this.log.info('subscribing to ' + ledger.id)
  const accountURI = ledger.id + '/accounts/' + dummyUser
  const websocketURI = ledger.id.replace(/^http/, 'ws') + '/websocket'

  try {
    // This is a hack. Creating an account on the ledger first
    yield this.createDummyAccount(accountURI)

    const creds = this.config.admin
    const auth = creds.user + ':' + creds.pass
    const ws = new WebSocket(websocketURI, {
      headers: {
        Authorization: 'Basic ' + new Buffer(auth, 'utf8').toString('base64')
      }
    })
    ws.once('message', (msg) => {
      msg = JSON.parse(msg)
      if (msg.method !== 'connect') {
        this.log.warn('expected connect method, but got:', msg)
      }

      ws.send(JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'subscribe_all_accounts',
        params: {
          eventType: 'transfer.*'
        }
      }))

      ws.on('message', (msg) => {
        msg = JSON.parse(msg)

        if (msg.method === 'notify') {
          this.emit('notification', msg.params)
        }
      })
    })
  } catch (err) {
    this.log.warn('could not reach ledger ' + ledger.id)
  }
}

Subscriber.prototype.createDummyAccount = function * (accountURI) {
  const putAccountRes = yield request({
    method: 'put',
    url: accountURI,
    auth: this.config.admin,
    json: true,
    body: { name: dummyUser, password: dummyUser, balance: '0' }
  })
  if (putAccountRes.statusCode >= 400) {
    throw new Error('Unexpected status code ' + putAccountRes.statusCode)
  }
}

module.exports = Subscriber

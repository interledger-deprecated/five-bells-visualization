'use strict'

const request = require('co-request')
const hashPassword = require('five-bells-shared/utils/hashPassword')

function Subscriber (base_uri, options) {
  this.notificationUri = base_uri + '/notifications'
  this.crawler = options.crawler
  this.log = options.log('subscriber')
  this.config = options.config

  let _this = this
  options.crawler.on('ledger', function * (ledger) {
    yield _this.subscribeLedger(ledger)
  })
}

// By using a single constant UUID we avoid duplicate subscriptions
// TODO Obviously that is a hack and will need to change eventually
const notificationUuid = '94f65a56-242c-4d9e-b2cb-d878c52fc3cc'

Subscriber.prototype.subscribeLedger = function *(ledger) {
  this.log.info('subscribing to ' + ledger.id)

  try {
    // This is a hack. Creating an account on the ledger first
    let putAccountRes = yield request({
      method: 'put',
      url: ledger.id + '/accounts/vinnie',
      auth: this.config.admin,
      json: true,
      body: {
        name: 'vinnie',
        password_hash: (yield hashPassword('vinnie')),
        balance: '0'
      }
    })
    if (putAccountRes.statusCode >= 400) {
      throw new Error('Unexpected status code ' + putAccountRes.statusCode)
    }

    let putSubscriptionRes = yield request.put({
      url: ledger.id + '/subscriptions/' + notificationUuid,
      json: true,
      auth: this.config.admin,
      body: {
        owner: ledger.id + '/accounts/vinnie',
        event: '*',
        subject: '*',
        target: this.notificationUri
      }
    })
    if (putSubscriptionRes.statusCode >= 400) {
      throw new Error('Unexpected status code ' + putSubscriptionRes.statusCode)
    }
  } catch (err) {
    this.log.warn('could not reach ledger ' + ledger.id)
  }
}

module.exports = Subscriber

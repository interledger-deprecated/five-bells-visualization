'use strict'

const request = require('co-request')

function Subscriber (base_uri, crawler, log) {
  this.notificationUri = base_uri + '/notifications'
  this.crawler = crawler
  this.log = log('subscriber')

  let _this = this
  crawler.on('ledger', function * (ledger) {
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
      json: true,
      body: {
        name: ledger.id + '/accounts/vinnie',
        password: 'vinnie',
        balance: '0'
      }
    })
    if (putAccountRes.statusCode >= 400) {
      throw new Error('Unexpected status code ' + putAccountRes.statusCode)
    }

    let putSubscriptionRes = yield request.put({
      url: ledger.id + '/subscriptions/' + notificationUuid,
      json: true,
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

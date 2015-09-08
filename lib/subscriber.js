'use strict'

const request = require('co-request')
const log = require('@ripple/five-bells-shared/services/log')('subscriber')
const config = require('../services/config')

function Subscriber (crawler) {
  this.crawler = crawler

  crawler.on('ledger', this.subscribeLedger)
}

// By using a single constant UUID we avoid duplicate subscriptions
// TODO Obviously that is a hack and will need to change eventually
const notificationUuid = '94f65a56-242c-4d9e-b2cb-d878c52fc3cc'

Subscriber.prototype.subscribeLedger = function *(ledger) {
  log.info('subscribing to ' + ledger.id)

  try {
    yield request.put({
      url: ledger.id + '/subscriptions/' + notificationUuid,
      json: true,
      body: {
        owner: 'vinnie',
        event: 'transfer.create',
        target: config.server.base_uri + '/notifications'
      }
    })
  } catch (err) {
    log.warn('could not reach ledger ' + ledger.id)
  }
}

exports.Subscriber = Subscriber

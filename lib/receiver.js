'use strict'

const crypto = require('crypto')
const cc = require('five-bells-condition')
const fetch = require('node-fetch')

class Receiver {
  constructor (log, config) {
    this.log = log('receiver')
    this.config = config
  }

  maybeFulfillCondition (transfer) {
    if (transfer.state === 'prepared' &&
        transfer.credits[0].memo &&
        transfer.credits[0].memo.receiverId) {
      const receiverId = transfer.credits[0].memo.receiverId
      const condition = this.getConditionForLedger(transfer.ledger, receiverId)

      // This will be true for the last transfer in the chain - which is the one
      // we need to fulfill.
      if (transfer.execution_condition === condition.getConditionUri()) {
        this.log.debug('fulfilling last transfer ' + transfer.id)

        fetch(transfer.id + '/fulfillment', {
          method: 'PUT',
          body: condition.serializeUri()
        })
          .then(() => {
            this.log.debug('fulfilled last transfer ' + transfer.id)
          })
          .catch((err) => {
            this.log.warn('transfer fulfillment failed for ' + transfer.id +
              ': ' + err.toString())
          })
      }
    }
  }

  getConditionForLedger (ledger, receiverId) {
    const ledgerSecret = this.getSecretForLedger(ledger)
    const conditionSecret = Receiver.hmac(ledgerSecret, receiverId)
    const condition = new cc.PreimageSha256()
    condition.setPreimage(conditionSecret)
    return condition
  }

  getSecretForLedger (ledger) {
    return Receiver.hmac(this.config.receiver.secret, ledger)
  }

  static hmac (key, message) {
    return crypto.createHmac('sha256', key).update(message).digest()
  }
}

module.exports = Receiver

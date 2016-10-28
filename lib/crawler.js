'use strict'

const request = require('co-request')
const emitter = require('co-emitter')

class Crawler extends emitter {
  constructor (log) {
    super()

    this.log = log('crawler')
    this.visitedNodes = {}
    this.visitedPairs = {}
    this.ledgers = {}
  }

  * crawl (ledgers, connectors) {
    Object.assign(this.ledgers, ledgers)
    for (const ledgerPrefix in ledgers) {
      try {
        yield this.crawlLedger(ledgerPrefix, ledgers[ledgerPrefix])
      } catch (err) {
        this.log.warn('could not reach ledger "' + ledgerPrefix + '"')
      }
    }

    for (const connectorAccount in connectors) {
      yield this.crawlConnector(connectorAccount, connectors[connectorAccount])
    }
  }

  * crawlLedger (ledgerPrefix, ledgerHost) {
    const infoRes = yield request.get({uri: ledgerHost, json: true})
    if (infoRes.statusCode !== 200) return
    const connectors = infoRes.body.connectors
    yield this.emit('ledger', {id: ledgerHost})
    for (let person of connectors) {
      // Currently only connectors have the `connector` property set
      if (person.connector) continue
      const nodeId = person.id
      if (this.visitedNodes[nodeId]) continue
      this.visitedNodes[nodeId] = true
      yield this.emit('user', {
        id: nodeId,
        ledger: ledgerHost
      })
    }
  }

  * crawlConnector (connectorAccount, pairs) {
    for (const pair of pairs) {
      const sourceLedger = pair[0].split('@')[1]
      const destinationLedger = pair[1].split('@')[1]
      const sourceLedgerHost = this.ledgers[sourceLedger]
      const destinationLedgerHost = this.ledgers[destinationLedger]

      // For the visualization we only care about unique connections
      const pairId = connectorAccount + ';' +
        (sourceLedger < destinationLedger
          ? (sourceLedger + ';' + destinationLedger)
          : (destinationLedger + ';' + sourceLedger))

      if (this.visitedPairs[pairId]) continue
      this.visitedPairs[pairId] = true
      yield this.emit('connector', {
        source: sourceLedgerHost,
        destination: destinationLedgerHost
      })
    }
  }
}

module.exports = Crawler

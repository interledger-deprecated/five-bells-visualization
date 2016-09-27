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

  * crawl (ledgers) {
    Object.assign(this.ledgers, ledgers)
    for (const ledgerPrefix in ledgers) {
      try {
        yield this.crawlLedger(ledgerPrefix, ledgers[ledgerPrefix])
      } catch (err) {
        this.log.warn('could not reach ledger "' + ledgerPrefix + '"')
      }
    }
  }

  * crawlLedger (ledgerPrefix, ledgerHost) {
    const infoRes = yield request.get({uri: ledgerHost, json: true})
    if (infoRes.statusCode !== 200) return
    const connectors = infoRes.body.connectors
    yield this.emit('ledger', {id: ledgerHost})
    for (let person of connectors) {
      // Currently only traders have the `connector` property set
      if (person.connector) {
        if (this.visitedNodes[person.connector]) continue
        this.visitedNodes[person.connector] = true
        yield this.crawlTrader(person.connector)
      } else {
        const nodeId = person.id
        if (this.visitedNodes[nodeId]) continue
        this.visitedNodes[nodeId] = true
        yield this.emit('user', {
          id: nodeId,
          ledger: ledgerHost
        })
      }
    }
  }

  * crawlTrader (traderHost) {
    const res = yield request.get({uri: traderHost + '/pairs', json: true})
    for (let pair of res.body) {
      const sourceLedger = this.ledgers[pair.source_ledger]
      const destinationLedger = this.ledgers[pair.destination_ledger]
      // For pathfinding we want to see all directed edges
      this.emit('pair', {
        source: sourceLedger,
        destination: destinationLedger,
        uri: traderHost
      })

      // For the visualization we only care about unique connections
      const pairId = traderHost + ';' +
        (pair.source_ledger < pair.destination_ledger
          ? (pair.source_ledger + ';' + pair.destination_ledger)
          : (pair.destination_ledger + ';' + pair.source_ledger))

      if (this.visitedPairs[pairId]) continue
      this.visitedPairs[pairId] = true
      yield this.emit('trader', {
        source: sourceLedger,
        destination: destinationLedger
      })
    }
  }
}

module.exports = Crawler

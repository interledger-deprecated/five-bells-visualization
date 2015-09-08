'use strict'

const _ = require('lodash')
const request = require('co-request')
const emitter = require('co-emitter')
const each = require('co-foreach')
const log = require('@ripple/five-bells-shared/services/log')('crawler')

exports.Crawler = Crawler

function Crawler (config) {
  this.queue = config.crawler.initialNodes.map(function (uri) {
    return {type: 'ledger', uri: uri}
  })
  this.visitedNodes = {}
  this.visitedPairs = {}
  this.ledgers = []
}

emitter(Crawler.prototype)

Crawler.prototype.crawl = function * crawl () {
  const self = this

  while (this.queue.length) {
    const node = this.queue.pop()
    self.visitedNodes[node.uri] = true
    log.info('crawling ' + node.type + ' ' + node.uri)

    try {
      let res
      switch (node.type) {
        case 'ledger':
          this.ledgers.push({id: node.uri})
          yield self.emit('ledger', {id: node.uri})
          res = yield request(node.uri + '/accounts', {json: true})
          if (res.statusCode === 200) {
            yield each(_.values(res.body), function *(person) {
              if (person.identity) {
                if (!self.visitedNodes[person.identity]) {
                  self.visitedNodes[person.identity] = true
                  self.queue.push({type: 'trader', uri: person.identity})
                }
              } else {
                const nodeId = person.id + '@' + node.uri
                if (!self.visitedNodes[nodeId]) {
                  self.visitedNodes[nodeId] = true
                  yield self.emit('user', {
                    id: nodeId,
                    ledger: node.uri
                  })
                }
              }
            })
          }
          break
        case 'trader':
          res = yield request(node.uri + '/pairs', {json: true})
          yield each(res.body, function *(pair) {
            if (!self.visitedNodes[pair.source_ledger]) {
              self.visitedNodes[pair.source_ledger] = true
              self.queue.push({type: 'ledger', uri: pair.source_ledger})
            }
            if (!self.visitedNodes[pair.destination_ledger]) {
              self.visitedNodes[pair.destination_ledger] = true
              self.queue.push({type: 'ledger', uri: pair.destination_ledger})
            }

            // For pathfinding we want to see all directed edges
            yield self.emit('pair', {
              source: pair.source_ledger,
              destination: pair.destination_ledger,
              uri: node.uri
            })

            // For the visualization we only care about unique connections
            const pairId = node.uri + ';' +
              (pair.source_ledger < pair.destination_ledger
                ? (pair.source_ledger + ';' + pair.destination_ledger)
                : (pair.destination_ledger + ';' + pair.source_ledger))

            if (!self.visitedPairs[pairId]) {
              self.visitedPairs[pairId] = true
              yield self.emit('trader', {
                source: pair.source_ledger,
                destination: pair.destination_ledger
              })
            }
          })
          break
      }
    } catch (err) {
      log.warn('could not reach ' + node.type + ' ' + node.uri +
        ', retrying in 5s')
      // Retry
      this.queue.push(node)
      yield wait(5000)
    }
  }
}

function wait (ms) {
  return function (done) {
    setTimeout(done, ms)
  }
}

Crawler.prototype.getLedgers = function () {
  return this.ledgers.slice()
}

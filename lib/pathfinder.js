'use strict';

const log = require('five-bells-shared/services/log')('pathfinder');
const Graph = require('./dijkstra').Graph;

function Pathfinder(crawler) {
  const self = this;

  this.crawler = crawler;
  this.graph = {};

  crawler.on('pair', function *(pair) {
    self.handleNewEdge(pair);
  });
}

Pathfinder.prototype.handleNewEdge = function (pair) {
  log.info('pathfinder indexing edge', pair);
  if (!this.graph[pair.source]) {
    this.graph[pair.source] = {};
  }
  this.graph[pair.source][pair.destination] = 1;
}

Pathfinder.prototype.findPath = function (sourceLedger, destinationLedger) {
  log.info('pathfinding ' + sourceLedger + ' -> ' + destinationLedger);

  const graph = new Graph(this.graph);
  return graph.findShortestPath(sourceLedger, destinationLedger);
};

exports.Pathfinder = Pathfinder;

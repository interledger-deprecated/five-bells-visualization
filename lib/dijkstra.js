'use strict'

var extractKeys = function (obj) {
  var keys = []
  var key
  for (key in obj) {
    Object.prototype.hasOwnProperty.call(obj, key) && keys.push(key)
  }
  return keys
}

var sorter = function (a, b) {
  return parseFloat(a) - parseFloat(b)
}

var findPaths = function (map, start, end, infinity) {
  infinity = infinity || Infinity

  var costs = {}
  var open = {'0': [start]}
  var predecessors = {}
  var keys

  var addToOpen = function (cost, vertex) {
    var key = '' + cost
    if (!open[key]) open[key] = []
    open[key].push(vertex)
  }

  costs[start] = 0

  while (open) {
    if (!(keys = extractKeys(open)).length) break

    keys.sort(sorter)

    var key = keys[0]
    var bucket = open[key]
    var node = bucket.shift()
    var currentCost = parseFloat(key)
    var adjacentNodes = map[node] || {}

    if (!bucket.length) delete open[key]

    for (var vertex in adjacentNodes) {
      if (Object.prototype.hasOwnProperty.call(adjacentNodes, vertex)) {
        var cost = adjacentNodes[vertex]
        var totalCost = cost + currentCost
        var vertexCost = costs[vertex]

        if ((vertexCost === undefined) || (vertexCost > totalCost)) {
          costs[vertex] = totalCost
          addToOpen(totalCost, vertex)
          predecessors[vertex] = node
        }
      }
    }
  }

  if (costs[end] === undefined) {
    return null
  } else {
    return predecessors
  }
}

var extractShortest = function (predecessors, end) {
  var nodes = []
  var u = end

  while (u) {
    nodes.push(u)
    u = predecessors[u]
  }

  nodes.reverse()
  return nodes
}

var findShortestPath = function (map, nodes) {
  var start = nodes.shift()
  var end
  var predecessors
  var path = []
  var shortest

  while (nodes.length) {
    end = nodes.shift()
    predecessors = findPaths(map, start, end)

    if (predecessors) {
      shortest = extractShortest(predecessors, end)
      if (nodes.length) {
        path.push.apply(path, shortest.slice(0, -1))
      } else {
        return path.concat(shortest)
      }
    } else {
      return null
    }

    start = end
  }
}

var toArray = function (list, offset) {
  try {
    return Array.prototype.slice.call(list, offset)
  } catch (e) {
    var a = []
    for (var i = offset || 0, l = list.length; i < l; ++i) {
      a.push(list[i])
    }
    return a
  }
}

var Graph = function (map) {
  this.map = map
}

Graph.prototype.findShortestPath = function (start, end) {
  if (Object.prototype.toString.call(start) === '[object Array]') {
    return findShortestPath(this.map, start)
  } else if (arguments.length === 2) {
    return findShortestPath(this.map, [start, end])
  } else {
    return findShortestPath(this.map, toArray(arguments))
  }
}

Graph.findShortestPath = function (map, start, end) {
  if (Object.prototype.toString.call(start) === '[object Array]') {
    return findShortestPath(map, start)
  } else if (arguments.length === 3) {
    return findShortestPath(map, [start, end])
  } else {
    return findShortestPath(map, toArray(arguments, 1))
  }
}

exports.Graph = Graph

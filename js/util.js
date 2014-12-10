var util = {};

util.greatestLower = function(a, gt) {
  var bs = function(low, high) {
    if (high < low)
      return low - 1;
    var mid = Math.floor((low + high) / 2);
    if (gt(a[mid]))
      return bs(low, mid - 1);
    else
      return bs(mid + 1, high);
  };
  return bs(0, a.length - 1);
};

/**
 * Given a set of nodes, will create bi-directions links between all of them.
 */
util.interconnectFully = function (nodes) {
  nodes.forEach(function (firstNode) {
    if (!Array.isArray(firstNode.advisors)) {
      firstNode.advisors = [];
    }
    nodes.forEach(function (secondNode) {
      if (!Array.isArray(secondNode.advisors)) {
        secondNode.advisors = [];
      }
      if (firstNode !== secondNode) {
        firstNode.advisors.push(secondNode);
        secondNode.advisors.push(firstNode);
      }
    })
  })

  // var initialLinks = [
  //   { source: initialNodes[0], target: initialNodes[1], hi: true, lo: true },
  //   { source: initialNodes[0], target: initialNodes[2], hi: true, lo: true },
  //   { source: initialNodes[0], target: initialNodes[3], hi: true, lo: true },
  //   { source: initialNodes[1], target: initialNodes[2], hi: true, lo: true },
  //   { source: initialNodes[1], target: initialNodes[3], hi: true, lo: true },
  //   { source: initialNodes[2], target: initialNodes[3], hi: true, lo: true },
  // ];
};

/**
 * Return a list of links between a set of nodes.
 *
 * Converts this:
 *
 *     [ { }, { advisors: [ <nodes[0]> ]}]
 *
 * To this:
 *
 *     [ { source: <nodes[0]>, target: <nodes[1]> }]
 */
util.generateLinks = function (nodes) {
  var links = [];

  // For all combinations of nodes
  for (var i = 0, l = nodes.length; i < l; i++) {
    for (var j = i+1; j < l; j++) {
      // Create a link
      var link = {
        source: nodes[i],
        target: nodes[j]
      };
      link.hi = !!~nodes[i].advisors.indexOf(nodes[j]);
      link.lo = !!~nodes[j].advisors.indexOf(nodes[i]);
      // Only store the link if it exists in either direction
      if (link.hi || link.lo) {
        links.push(link);
      }
    }
  }

  return links;
};

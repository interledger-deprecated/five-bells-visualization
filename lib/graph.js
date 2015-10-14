'use strict';

var dfs = function (map, start, end, maxDepth) {
    //console.info("dfs: map:" + map + " start:" + start +" end:" + end + " maxDepth:" + maxDepth);
    var found = [];
    (function dfs_recur(node, visited, depth) {
        //console.info("dfs_recur node:" + node);
        var adj = map[node];
        visited.push(node);
        for (var nextNode in adj) {
            //console.info("dfs nextNode:" + nextNode + " visited:" + visited + " end:" + end);
            if (nextNode == end) {
                found.push(visited.slice(0).concat(end));
            } else if ((visited.indexOf(nextNode) == -1) && (depth <= maxDepth))
            {
                dfs_recur(nextNode, visited.slice(0), depth + 1);
            }
        }
    })(start, [], 0);
    //console.info("dfs found:" + found);
    return found;
};

var bfs = function (map, start, end) {
    //console.info("bfs map:" + map + " start:" + start + " end:" + end + " found:" + found);
    var frontier = [start];
    var level = 0, firstParents = {};
    var found = [];

    while (frontier.length > 0) {
        var next = [];
        for (var i in frontier) {
            var node = frontier[i];
            //console.info("bfs node:" + node);
            for (var nextNode in map[node]) {
                //var adj = map[nextNode];
                //console.info("nextNode:" + nextNode + " first-parent:" + firstParents[nextNode]);
                //if (firstParents[nextNode] === undefined) {
                    next.push(nextNode);
                if (firstParents[nextNode] === undefined) {
                    firstParents[nextNode] = node;
                }
                if (nextNode == end) {
                    found.push(node); // save the next-to-end node; paths can be reconstructed from the firstParents map
                }
            }
        }
        if (found.length > 0) {
            break; // only care about the shortest paths of the same length
        }
        frontier = next;
        level += 1;
    }
    var foundPaths = [];
    for (var i in found) {
        var penultimateNode = found[i];
        //console.info("penultimateNode:" + penultimateNode);
        var u = penultimateNode;
        var p = [end];
        while (u) {
            //console.info("u:" + u);
            p.push(u);
            u = firstParents[u];
        }
        foundPaths.splice(1,0,p.reverse());
    }
    return foundPaths;
};

var findShortestPath = function (map, start, end) {
    return dfs(map, start, end, 4);
//    return bfs(map, start, end);
};

var Graph = function (map) {
	this.map = map;
}

Graph.prototype.findShortestPath = function (start, end) {
    return findShortestPath(this.map, start, end);

}

Graph.findShortestPath = function (map, start, end) {
    return findShortestPath(map, start, end);
}

exports.Graph = Graph;

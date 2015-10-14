'use strict';

const Graph = require('./graph.js').Graph;

var map = {};

map["USD"] = {};
map["USD"]["JPY"] = 1;
map["USD"]["BTC"] = 1;
map["USD"]["XRP"] = 1;
map["USD"]["TED"] = 1;
map["TED"] = {};
map["TED"]["ALI"] = 1;
//map["TED"]["BOB"] = 1;
map["XRP"] = {};
map["XRP"]["XAU"] = 1;
map["XRP"]["ALI"] = 1;
map["XAU"] = {};
map["XAU"]["BOB"] = 1;
map["ALI"] = {};
map["ALI"]["BOB"] = 1;
map["ALI"]["TED"] = 1;


const graph = new Graph(map);
const paths = graph.findShortestPath("USD","BOB");

for (var i in paths) {
    console.info("paths[:" + i + "]: " + paths[i]);
}

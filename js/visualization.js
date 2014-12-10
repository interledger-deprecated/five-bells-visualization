var Visualization = function () {
  this.width = $(document).width();
  this.height = $(document).height();

  this.nodes = [
    { id: 0, x: this.width/2 - 100, y: this.height/2 - 100 },
    { id: 1, x: this.width/2 - 100, y: this.height/2 + 100 },
    { id: 2, x: this.width/2 + 100, y: this.height/2 - 100 },
    { id: 3, x: this.width/2 + 100, y: this.height/2 + 100 }
  ];

  this.links = [
    { source: this.nodes[0], target: this.nodes[1], hi: true, lo: true },
    { source: this.nodes[0], target: this.nodes[2], hi: true, lo: true },
    { source: this.nodes[0], target: this.nodes[3], hi: true, lo: true },
    { source: this.nodes[1], target: this.nodes[2], hi: true, lo: true },
    { source: this.nodes[1], target: this.nodes[3], hi: true, lo: true },
    { source: this.nodes[2], target: this.nodes[3], hi: true, lo: true },
  ];
};

Visualization.prototype.setup = function () {
  this.svg = d3.select('body').append('svg')
      .attr('width', this.width)
      .attr('height', this.height);

  this.force = d3.layout.force()
      .size([this.width, this.height])
      .nodes(this.nodes)
      .links(this.links);

  this.force.linkDistance(150);

  // Create the SVG groups
  this.linkGroup = this.svg.append("g").attr("id","linkGroup");
  this.arrowheadGroup = this.svg.append("g").attr("id","arrowheadGroup");
  this.nodeGroup = this.svg.append("g").attr("id","nodeGroup");

  // Create the arrowhead path
  this.svg.append("svg:defs").selectAll("marker")
    .data([
      {id: "start", refX: -12, path: "M10,-5L0,0L10,5"},
      {id: "end", refX: 22, path: "M0,-5L10,0L0,5"}
    ])
  .enter().append("svg:marker")
    .attr("id", function (d) { return d.id; })
    .attr("viewBox", "0 -5 10 10")
    .attr("refX", function (d) { return d.refX; })
    .attr("refY", 0)
    .attr("markerWidth", 6)
    .attr("markerHeight", 6)
    .attr("orient", "auto")
  .append("svg:path")
    .attr("d", function (d) { return d.path; });

  this.force.on('tick', this.tick.bind(this));

  this.start();
};

Visualization.prototype.start = function () {
  this.node = this.nodeGroup.selectAll('.node')
    .data(this.nodes, function(d) { return d.id;});
  this.node.enter().append('circle')
    .attr('class', 'node');
  this.node.exit().remove();

  this.link = this.linkGroup.selectAll(".link")
    .data(this.links, function(d) { return d.source.id + "-" + d.target.id; });
  this.link.enter().append('line')
    .attr('class', 'link')
    .attr("marker-start", function (d) { return d.lo ? "url(#start)" : null; })
    .attr("marker-end", function (d) { return d.hi ? "url(#end)" : null; });
  this.link.exit().remove();

  this.force.start();
};

Visualization.prototype.tick = function () {
  this.node.attr('r', 15)
      .attr('cx', function(d) { return d.x; })
      .attr('cy', function(d) { return d.y; });

  this.link.attr('x1', function(d) { return d.source.x; })
      .attr('y1', function(d) { return d.source.y; })
      .attr('x2', function(d) { return d.target.x; })
      .attr('y2', function(d) { return d.target.y; });
};

Visualization.prototype.addNode = function () {
  var _this = this;
  var id = this.nodes.length;
  var newNode = {id: id};
  this.nodes.push(newNode);
  this.nodes.forEach(function (node) {
    if (id !== node.id) {
      _this.links.push({source: newNode, target: node, hi: true});
    }
  });
  this.start();
};

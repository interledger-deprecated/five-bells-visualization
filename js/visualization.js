var Visualization = function () {
  this.width = $(document).width();
  this.height = $(document).height();

  this.nodes = [
    { id: 0 },
    { id: 1 },
    { id: 2 },
    { id: 3 }
  ];

  this.links = [
    { source: 0, target: 1 },
    { source: 0, target: 2 },
    { source: 0, target: 3 },
    { source: 1, target: 0 },
    { source: 1, target: 2 },
    { source: 1, target: 3 },
    { source: 2, target: 0 },
    { source: 2, target: 1 },
    { source: 2, target: 3 },
    { source: 3, target: 0 },
    { source: 3, target: 1 },
    { source: 3, target: 2 },
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
    .data(["end"])      // Different link/path types can be defined here
  .enter().append("svg:marker")    // This section adds in the arrows
    .attr("id", String)
    .attr("viewBox", "0 -5 10 10")
    .attr("refX", 22)
    .attr("refY", 0)
    .attr("markerWidth", 6)
    .attr("markerHeight", 6)
    .attr("orient", "auto")
  .append("svg:path")
    .attr("d", "M0,-5L10,0L0,5");

  this.force.on('tick', this.tick.bind(this));

  this.start();
};

Visualization.prototype.start = function () {
  this.link = this.linkGroup.selectAll(".link")
    .data(this.links, function(d) { return d.source.id + "-" + d.target.id; })
  console.log(this.link.enter());
  this.link.enter().append('line')
    .attr('class', 'link')
    .attr("marker-end", "url(#end)");
  this.link.exit().remove();

  this.node = this.nodeGroup.selectAll('.node')
    .data(this.nodes, function(d) { return d.id;})
  this.node.enter().append('circle')
    .attr('class', 'node');
  this.node.exit().remove();

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
  this.nodes.push({id: id});
  this.nodes.forEach(function (node) {
    if (id !== node.id) {
      _this.links.push({source: id, target: node.id});
    }
  });
  this.start();
};

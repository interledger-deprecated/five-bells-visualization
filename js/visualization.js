var Visualization = function (state) {
  this.width = $(document).width();
  this.height = $(document).height();

  this.state = state;

  state.on('change', this.start.bind(this));
};

Visualization.prototype = _.clone(EventEmitter.prototype);

Visualization.messageColors = {
  'ping': '#60BD68',
  'pong': '#5DA5DA'
};

Visualization.prototype.setup = function () {
  this.svg = d3.select('body').append('svg')
      .attr('width', this.width)
      .attr('height', this.height);

  this.force = d3.layout.force()
      .size([this.width, this.height])
      .nodes(this.state.current.nodes)
      .links(util.generateLinks(this.state.current.nodes));

  this.drag = this.force.drag()
    .on('dragstart', Visualization.handleNodeDragStart);

  this.force.linkDistance(150);

  // Create the SVG groups
  this.linkGroup = this.svg.append("g").attr("id","linkGroup");
  this.arrowheadGroup = this.svg.append("g").attr("id","arrowheadGroup");
  this.messageGroup = this.svg.append("g").attr("id","messageGroup");
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
    .data(this.state.current.nodes, function(d) { return d.id;});
  this.node.enter().append('circle')
    .attr('class', 'node')
    .attr('r', 15)
    .on('click', this.handleNodeClick.bind(this))
    .on('dblclick', Visualization.handleNodeDblClick)
    .classed("fixed", function(d) { return d.fixed; })
    .call(this.drag);
  this.node.exit().remove();

  var links = util.generateLinks(this.state.current.nodes);
  this.link = this.linkGroup.selectAll(".link")
    .data(links, function(d) { return d.source.id + "-" + d.target.id; });
  this.link.enter().append('line')
    .attr('class', 'link');
  this.link.exit().remove();

  this.force
    .nodes(this.state.current.nodes)
    .links(links)
    .start();

  // console.log(_.cloneDeep(this.state.current.messages));
  this.message = this.messageGroup.selectAll(".message")
    .data(this.state.current.messages, function (d) { return d.id; });
  this.message.enter().append('circle')
    .attr('class', 'message')
    .attr('r', 10)
    .style('fill', function (d) { return Visualization.messageColors[d.type]; });
  this.message.exit().remove();
};

Visualization.prototype.tick = function () {
  var _this = this;

  this.node
    .attr('cx', function(d) { return d.x; })
    .attr('cy', function(d) { return d.y; })
    .style('fill', function (d) { return d.color; });

  this.link
    .attr('x1', function(d) { return d.source.x; })
    .attr('y1', function(d) { return d.source.y; })
    .attr('x2', function(d) { return d.target.x; })
    .attr('y2', function(d) { return d.target.y; })
    .attr("marker-start", function (d) { return d.lo ? "url(#start)" : null; })
    .attr("marker-end", function (d) { return d.hi ? "url(#end)" : null; });

  this.message
    .attr('cx', function (d) {
      var pos = (_this.state.current.time - d.sendTime) / (d.recvTime - d.sendTime);
      pos = Math.max(0, Math.min(1, pos));
      return d.source.x + (d.target.x - d.source.x) * pos;
    })
    .attr('cy', function (d) {
      var pos = (_this.state.current.time - d.sendTime) / (d.recvTime - d.sendTime);
      pos = Math.max(0, Math.min(1, pos));
      return d.source.y + (d.target.y - d.source.y) * pos;
    });
};

Visualization.prototype.handleNodeClick = function (d) {
  this.emit('nodeClick', d);
};
Visualization.handleNodeDblClick = function (d) {
  d3.select(this).classed("fixed", d.fixed = false);
};
Visualization.handleNodeDragStart = function (d) {
  d3.select(this).classed("fixed", d.fixed = true);
};

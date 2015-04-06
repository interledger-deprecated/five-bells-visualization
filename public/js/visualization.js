import { greatestLower, generateLinks } from 'js/util';

export default class Visualization extends EventEmitter {
  constructor(state) {
    super();

    this.width = window.innerWidth;
    this.height = window.innerHeight;

    this.state = state;

    state.on('change', this.start.bind(this));
  }

  setup() {
    this.svg = d3.select('body').append('svg')
        .attr('width', this.width)
        .attr('height', this.height);

    this.force = d3.layout.force()
        .charge(-100)
        .gravity(0.01)
        .linkDistance(50)
        .size([this.width, this.height])
        .nodes(this.state.current.nodes)
        .links(generateLinks(this.state.current.nodes));

    this.drag = this.force.drag()
      .on('dragstart', Visualization.handleNodeDragStart);

    // Create the SVG groups
    this.linkGroup = this.svg.append('g').attr('id', 'linkGroup');
    this.arrowheadGroup = this.svg.append('g').attr('id', 'arrowheadGroup');
    this.messageGroup = this.svg.append('g').attr('id', 'messageGroup');
    this.nodeGroup = this.svg.append('g').attr('id', 'nodeGroup');
    this.eventGroup = this.svg.append('g').attr('id', 'eventGroup');

    // Create the arrowhead path
    this.svg.append('svg:defs').selectAll('marker')
      .data([
        {id: 'start', refX: -12, path: 'M10,-5L0,0L10,5'},
        {id: 'end', refX: 22, path: 'M0,-5L10,0L0,5'}
      ])
    .enter().append('svg:marker')
      .attr('id', d => d.id)
      .attr('viewBox', '0 -5 10 10')
      .attr('refX', d => d.refX)
      .attr('refY', 0)
      .attr('markerWidth', 6)
      .attr('markerHeight', 6)
      .attr('orient', 'auto')
    .append('svg:path')
      .attr('d', d => d.path);

    this.force.on('tick', this.tick.bind(this));

    d3.select(window).on('resize', this.resize.bind(this));

    this.start();
  }

  resize() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;

    this.svg
      .attr('width', this.width)
      .attr('height', this.height);

    this.force.size([this.width, this.height]).resume();
  }

  start() {
    this.node = this.nodeGroup.selectAll('.node')
      .data(this.state.current.nodes, d => d.id);
    this.node.enter().append('circle')
      .attr('class', d => 'node type-' + d.type)
      .attr('r', 10)
      .on('click', this.handleNodeClick.bind(this))
      .on('dblclick', Visualization.handleNodeDblClick)
      .classed('fixed', d => d.fixed)
      .call(this.drag);
    this.node.exit().remove();

    const links = generateLinks(this.state.current.nodes);
    this.link = this.linkGroup.selectAll('.link')
      .data(links, d => d.source.id + '-' + d.target.id);
    this.link.enter().append('line')
      .attr('class', 'link');
    this.link.exit().remove();

    const events = Array.from(this.state.current.events);
    this.event = this.eventGroup.selectAll('.event')
      .data(events, d => d.id);
    const eventContainer = this.event.enter().append('g')
      .attr('class', d => 'event state-' + d.state);
    eventContainer.append('rect')
      .attr('rx', 6)
      .attr('ry', 6)
      .attr('x', -50)
      .attr('y', -12.5)
      .attr('width', 100)
      .attr('height', 25);
    eventContainer.append('text')
      .text(d => d.text);
    this.event.exit().transition()
      .style('opacity', 0)
      .remove();

    this.force
      .nodes(this.state.current.nodes)
      .links(links)
      .start();

    // console.log(_.cloneDeep(this.state.current.messages));
    this.message = this.messageGroup.selectAll('.message')
      .data(this.state.current.messages, d => d.id);
    this.message.enter().append('circle')
      .attr('class', d => 'message type-' + d.type)
      .attr('r', 6);
    this.message.exit().remove();
  }

  tick() {
    this.node
      .attr('cx', d => d.x)
      .attr('cy', d => d.y)
      .style('fill', d => d.color);

    this.link
      .attr('x1', d => d.source.x)
      .attr('y1', d => d.source.y)
      .attr('x2', d => d.target.x)
      .attr('y2', d => d.target.y)
      .attr('marker-start', d => d.lo ? 'url(#start)' : null)
      .attr('marker-end', d => d.hi ? 'url(#end)' : null);

    this.event
      .attr('class', d => 'event state-' + d.state)
      .attr('transform', d => 'translate(' + (d.related.x + d.offsetX) + ',' +
        (d.related.y + d.offsetY) + ')')
      .select('text').text(d => d.text);

    this.message
      .attr('cx', d => {
        let pos = (this.state.current.time - d.sendTime) /
          (d.recvTime - d.sendTime);
        pos = Math.max(0, Math.min(1, pos));
        return d.source.x + (d.target.x - d.source.x) * pos;
      })
      .attr('cy', d => {
        let pos = (this.state.current.time - d.sendTime) /
          (d.recvTime - d.sendTime);
        pos = Math.max(0, Math.min(1, pos));
        return d.source.y + (d.target.y - d.source.y) * pos;
      });
  }

  handleNodeClick(d) {
    this.emit('nodeClick', d);
  }
  handleNodeDblClick(d) {
    d3.select(this).classed('fixed', d.fixed = false);
  }
  handleNodeDragStart(d) {
    d3.select(this).classed('fixed', d.fixed = true);
  }
}

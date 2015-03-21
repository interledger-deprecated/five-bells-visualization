
// '#60BD68', // green
// '#FAA43A', // orange
// '#5DA5DA', // blue
// '#F17CB0', // pink
// '#B2912F', // brown
// '#B276B2', // purple
// '#DECF3F', // yellow
// '#F15854', // red
// '#4D4D4D'  // gray

const colorMapping = {
  'five-bells-ledger': '#5DA5DA',
  'five-bells-trader': '#F15854'
};

export default class Parser {
  constructor(state) {
    this.state = state;
    this.nodes = [];
  }

  parseLine(line) {
    const data = line.split(' ');
    const pid = data.shift();
    if (!this.nodes[pid]) {
      this.nodes[pid] = {id: pid};
      this.state.current.nodes.push(this.nodes[pid]);
    }

    let node = this.nodes[pid];

    // Get process type
    // data = [">", "five-bells-ledger@1.0.0", "start", "/five-bells-ledger"]
    if (data[2] === 'start') {
      node.color = colorMapping[data[1].split('@')[0]];
      console.log(node.color);
    }

    // Filter out nodemon lines
    // data = ["20", "Mar", "18:13:45", "-", "[nodemon]", "v1.3.7"]
    if (data[4] === '[nodemon]') {
      return;
    }

    console.log(pid, data);
  }
}

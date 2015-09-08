export default class UI {
  constructor (state, viz, parser) {
    this.state = state
    this.viz = viz
    this.parser = parser

    this.rateLimit = false

    const gui = new dat.GUI()
    gui.add(this, 'rateLimit')
  }
}

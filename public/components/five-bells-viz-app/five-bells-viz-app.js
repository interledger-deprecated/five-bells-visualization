Polymer('five-bells-viz-app', {
  handleSettlementSelected: function (event) {
    this.$.graph.selectSettlement(event.detail)
  }
})

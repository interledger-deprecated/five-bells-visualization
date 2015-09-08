Polymer('five-bells-viz-history', {
  settlements: [],
  handleSettlement: function (event) {
    console.log('settlement', event.detail.msg)
    // this.settlements.push(event.detail.msg.detail)
    this.settlements = [event.detail.msg.detail]
  },
  handleHistoryEntryTap: function (event) {
    const settlement = event.target.templateInstance.model.settlement
    this.fire('settlement-select', settlement)
  }
})

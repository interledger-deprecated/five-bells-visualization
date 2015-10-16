Polymer('five-bells-viz-history', {
  payments: [],
  handlePayment: function (event) {
    console.log('payment', event.detail.msg)
    // this.payments.push(event.detail.msg.detail)
    this.payments = [event.detail.msg.detail]
  },
  handleHistoryEntryTap: function (event) {
    const payment = event.target.templateInstance.model.payment
    this.fire('payment-select', payment)
  }
})

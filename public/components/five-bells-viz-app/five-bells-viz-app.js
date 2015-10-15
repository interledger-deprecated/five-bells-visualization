
Polymer('five-bells-viz-app', {
  handlePaymentSelected: function (event) {
    this.$.graph.selectPayment(event.detail);
  }
});

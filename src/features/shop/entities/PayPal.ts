export class PayPal {
  constructor(readonly module: number) {}

  public clientId = ''
  public secret = ''
  public orderId = ''
  public paymentId = ''
  public accessToken = ''
  public accessTokenExpiresIn = 0

  // --- [ Getter ] --------------------------------------------------------------------------------

  public get isOrderCreated() {
    return !!this.orderId
  }

  public get isPaymentCompleted() {
    return !!this.paymentId
  }

  // --- [ Methods ] ------------------------------------------------------------------------------

  display() {
    return Object.freeze({
      clientId: this.clientId,
      orderId: this.orderId,
      paymentId: this.paymentId
    })
  }
}

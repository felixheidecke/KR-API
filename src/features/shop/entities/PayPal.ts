export class PayPal {
  constructor(readonly module: number) {}

  public clientId = ''
  public secret = ''
  public orderId = ''
  public paymentId = ''
  private _accessToken = ''
  private _accessTokenExpiresIn = 0

  // --- [ Setter ] --------------------------------------------------------------------------------

  public set accessToken(token: string) {
    this._accessToken = token
  }

  public set accessTokenExpiresIn(expiresIn: number) {
    this._accessTokenExpiresIn = expiresIn
  }

  // --- [ Getter ] --------------------------------------------------------------------------------

  public get accessToken() {
    return this._accessToken
  }

  public get accessTokenExpiresIn() {
    return this._accessTokenExpiresIn
  }

  public get isOrderCreated() {
    return !!this.orderId
  }

  public get isPaymentCompleted() {
    return !!this.paymentId
  }
}

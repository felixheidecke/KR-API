export class Module {
  constructor(readonly id: number) {}

  public type = ''
  public name = ''
  public url: string | URL = ''
  public customerId = 0

  public display() {
    return Object.freeze({
      name: this.name,
      type: this.type,
      url: this.url.toString(),
      customerId: this.customerId
    })
  }
}

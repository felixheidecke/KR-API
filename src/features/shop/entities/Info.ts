import { Customer } from './Customer.js'
import { ShippingCost } from './ShippingCost.js'
import { SupplementalCost } from './SupplementalCost.js'

export class Info {
  constructor(readonly module: number) {
    this.client = new Customer()
    this.shippingCost = new ShippingCost(module)
    this.supplementalCost = new SupplementalCost(module)
  }

  public client: Customer
  public shippingCost: ShippingCost
  public supplementalCost: SupplementalCost

  public display() {
    return Object.freeze({
      client: this.client.display(),
      supplementalCost: this.supplementalCost.display(),
      shippingCost: this.shippingCost.display()
    })
  }
}

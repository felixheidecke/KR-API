import { Customer } from './customer.js'
import { ShippingCost } from './shipping-cost.js'
import { SupplementalCost } from './supplemental-cost.js'

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

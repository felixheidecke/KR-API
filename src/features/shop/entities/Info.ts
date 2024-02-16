import { Client } from './Client.js'
import { ShippingCost } from './ShippingCost.js'
import { SupplementalCost } from './SupplementalCost.js'

export class Info {
  constructor(readonly module: number) {
    this.client = new Client(module)
    this.shippingCost = new ShippingCost(module)
    this.supplementalCost = new SupplementalCost(module)
  }

  public client: Client
  public shippingCost: ShippingCost
  public supplementalCost: SupplementalCost

  public display() {
    return Object.freeze(new InfoDisplay(this))
  }
}

class InfoDisplay {
  constructor(info: Info) {
    this.client = info.client.display()
    this.supplementalCost = info.supplementalCost.display()
    this.shippingCost = info.shippingCost.display()
  }

  readonly client
  readonly supplementalCost
  readonly shippingCost
}

import expandPrice from '../../../common/utils/expand-price.js'
import { sortedMap } from '../../../common/utils/sorted-map.js'
import { UNIT } from '../utils/constants.js'

export class ShippingCost {
  constructor(module: number) {
    this.module = module
  }

  // --- [ Member ] --------------------------------------------------------------------------------

  private _rates: Map<number, number> = new Map()
  public module: number
  public id: number = 0
  public freeShippingThreshold: number | null = null
  public unit = UNIT.kg

  // --- [ Getter ] --------------------------------------------------------------------------------

  get rates() {
    return Array.from(this._rates).map(([threshold, rate]) => ({ threshold, rate }))
  }

  // --- [ Methods ] -------------------------------------------------------------------------------

  public addRate(threshold: number, price: number) {
    this._rates.set(threshold, price)
    this._rates = sortedMap(this._rates)
  }

  public removeRate(threshold: number) {
    this._rates.delete(threshold)
  }

  public hasRateByWeight(weight: number) {
    return !!this.getRateByWeight(weight)
  }

  public getRateByWeight(weight: number) {
    const { rate } = this.rates.find(({ threshold }) => threshold >= weight) || {}

    return rate || null
  }

  public display() {
    return Object.freeze(new ShippingCostDisplay(this))
  }
}

class ShippingCostDisplay {
  constructor(shippingCost: ShippingCost) {
    this.$module = shippingCost.module
    this.$id = shippingCost.id
    this.rates = shippingCost.rates.map(({ threshold, rate }) => ({
      threshold,
      rate: expandPrice(rate)
    }))
    this.freeShippingThreshold = shippingCost.freeShippingThreshold
    this.unit = shippingCost.unit
  }

  readonly $module: number
  readonly $id: number
  readonly rates: {
    threshold: number
    rate: ReturnType<typeof expandPrice>
  }[]
  readonly freeShippingThreshold: number | null
  readonly unit: string
}

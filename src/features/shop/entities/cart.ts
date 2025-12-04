import { ShippingCost } from './shipping-cost.js'
import { SupplementalCost } from './supplemental-cost.js'
import expandPrice from '#utils/expand-price.js'
import round from '#utils/round.js'

import type { Product } from './product.js'

type CartProducts = Map<
  number,
  {
    product: Product
    quantity: number
    weight: number
    total: number
  }
>

export class Cart {
  constructor(readonly module: number) {
    this.supplementalCost = new SupplementalCost(module)
    this.shippingCost = new ShippingCost(module)
  }

  // --- [ Member ] --------------------------------------------------------------------------------

  private _gross = 0
  private _isCalculated = false
  private _total = 0
  private _weight = 0
  protected _products: CartProducts = new Map()

  public shipping = 0
  public shippingCost: ShippingCost
  public shippingUnit = ''
  public supplementalCost: SupplementalCost

  // --- [ Setter ] --------------------------------------------------------------------------------

  public setSupplementalCost(supplementalCost: SupplementalCost) {
    this.supplementalCost = supplementalCost

    return this
  }

  public setShippingCost(shippingCost: ShippingCost) {
    this.shippingCost = shippingCost

    return this
  }

  // --- [ Getter ] --------------------------------------------------------------------------------

  get isCalculated() {
    return this._isCalculated
  }

  get products() {
    return Array.from(this._products.values())
  }

  get gross() {
    return this._gross
  }

  get total() {
    return this._total
  }

  get weight() {
    return this._weight
  }

  get size() {
    return !this._products.size
  }

  // --- [ Methods ] -------------------------------------------------------------------------------

  public getProduct(productId: number) {
    return this._products.get(productId)
  }

  public addProduct(product: Product, quantity = 1) {
    this._products.set(product.id, {
      product,
      quantity,
      weight: (product.weight?.value || 0) * quantity,
      total: (product?.price || 0) * quantity
    })

    this._isCalculated = false

    return this
  }

  public removeProduct(productId: number) {
    this._products.delete(productId)

    this._isCalculated = false

    return this
  }

  public calculate() {
    if (this._isCalculated) return

    let gross = 0
    let shipping = 0
    let total = 0
    let weight = 0

    // Add up product price and weight
    this._products.forEach(product => {
      gross += product.total
      weight += product.weight
    })

    gross = gross // fix rounding error
    total = gross
    total += this.supplementalCost.price || 0
    shipping = this.shippingCost.getRateByWeight(weight) ?? 0

    if (
      this.shippingCost.freeShippingThreshold &&
      gross >= this.shippingCost.freeShippingThreshold
    ) {
      shipping = 0
    }

    total += shipping

    this._gross = round(gross)
    this._total = round(total)
    this._weight = weight

    this.shipping = shipping
    this.shippingUnit = this.shippingCost.unit

    this._isCalculated = true
  }

  public display() {
    return Object.freeze({
      gross: expandPrice(this.gross),
      total: expandPrice(this.total),
      weight: this.weight,
      products: this.products.map(product => {
        return {
          ...product,
          total: expandPrice(product.total),
          product: product.product.display()
        }
      }),
      shipping: {
        price: this.shipping
          ? expandPrice(this.shipping)
          : {
              value: this.shipping,
              formatted: 'kostenlos'
            },
        unit: this.shippingUnit
      },
      supplementalCost: this.supplementalCost.price ? this.supplementalCost.display() : undefined
    })
  }
}

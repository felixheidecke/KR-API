import { Product } from './Product.js'
import { ShippingCost } from './ShippingCost.js'
import { SupplementalCost } from './SupplementalCost.js'
import expandPrice from '../../../common/utils/expand-price.js'
import round from '../../../common/utils/round.js'

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

  protected _products: CartProducts = new Map()

  public supplementalCost: SupplementalCost
  public shippingCost: ShippingCost
  public gross = 0
  public total = 0
  public shipping = 0
  public shippingUnit = ''
  public weight = 0

  // --- [ Getter ] --------------------------------------------------------------------------------

  get products() {
    return Array.from(this._products.values())
  }

  get isEmpty() {
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

    return this
  }

  public removeProduct(productId: number) {
    this._products.delete(productId)

    return this
  }

  public calculate() {
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
    total += this.supplementalCost?.price || 0

    shipping = this.shippingCost.getRateByWeight(weight) ?? 0
    total += shipping

    this.gross = round(gross)
    this.total = round(total)
    this.weight = weight

    this.shipping = shipping
    this.shippingUnit = this.shippingCost.unit
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

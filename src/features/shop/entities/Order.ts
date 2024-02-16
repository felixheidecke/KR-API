import { fromUnixTime } from 'date-fns'
import { isEmpty, isNumber, omitBy } from 'lodash-es'
import expandPrice from '../../../common/utils/expand-price.js'
import randomId from '../../../common/utils/random-id.js'

import type { Product } from './Product.js'

type CartProduct = {
  id: number
  code: string
  name: string
  description: string
  price: number
  quantity: number
  total: number
}

type Address = {
  company?: string
  salutation?: string
  firstname?: string
  name?: string
  address?: string
  zip?: string
  city?: string
  email?: string
  phone?: string
}

type DeliveryAddress = {
  name?: string
  address?: string
  zip?: string
  city?: string
  company?: string
  phone?: string
}

export class Order {
  constructor(readonly module: number) {}

  public total = 0
  public shippingCost = 0
  public paymentType: 'paypal' | 'prepayment' = 'prepayment'
  public message: string | undefined
  private _address: Address = {}
  private _deliveryAddress: DeliveryAddress = {}
  private _transactionId: string = ''
  private _date: Date | null = null
  private _cart: CartProduct[] = []

  /**
   * Sets the date.
   * @param {number | Date} date - The date as a number or Date object.
   * @returns The current instance for chaining.
   */
  public set date(date: number | Date | null) {
    if (!date) {
      this._date = null
      return
    }

    this._date = isNumber(date) ? fromUnixTime(date) : date
  }

  /**
   * Sets the transaction ID.
   * @param {string | number} id - The transaction ID to set.
   * @returns The current instance for chaining.
   */
  public set transactionId(id: string | number | null) {
    this._transactionId = id ? id.toString().toLowerCase() : ''
  }

  /**
   * Sets the address.
   * @param {Address} address - The address to set.
   * @returns The current instance for chaining.
   */
  public set address(address: Address) {
    this._address = address ? (omitBy(address, isEmpty) as Address) : {}
  }

  /**
   * Sets the delivery address.
   * @param {DeliveryAddress | null} address - The delivery address to set.
   * @returns The current instance for chaining.
   */
  public set deliveryAddress(address: DeliveryAddress | null) {
    this._deliveryAddress = address ? (omitBy(address, isEmpty) as DeliveryAddress) : {}
  }

  /**
   * Sets the cart with the provided products.
   * @param {CartProduct[]} products - An array of products to be added to the cart.
   * @returns The updated Order instance.
   */
  public set cart(products: CartProduct[]) {
    this._cart = products
  }

  // --- [ Getter ] --------------------------------------------------------------------------------

  public get address(): Address {
    return this._address
  }

  public get deliveryAddress(): DeliveryAddress {
    return this._deliveryAddress
  }

  public get transactionId(): string {
    return this._transactionId
  }

  public get date(): Date | null {
    return this._date
  }

  public get cart(): CartProduct[] {
    return this._cart
  }

  public get isEmpty(): boolean {
    return !this._cart.length
  }

  public get hasAddress(): boolean {
    return !isEmpty(this._address)
  }

  public get hasDeliveryAddress(): boolean {
    return !isEmpty(this.deliveryAddress)
  }

  // --- [ Methods ] -------------------------------------------------------------------------------

  /**
   * Adds a product to the order's cart.
   * @param {CartProduct} product - The product to be added.
   */
  public addCartProduct(product: CartProduct) {
    this._cart.push(product)
  }

  public addProduct(product: Product) {
    this.addCartProduct({
      id: product.id,
      code: product.code || '',
      name: product.name || '',
      description: product.description || '',
      price: product.price || 0,
      quantity: 1,
      total: product.price || 0
    })
  }

  /**
   * Generates a random transaction ID.
   * @returns The current instance for chaining.
   */
  public generateTransactionId(): this {
    this._transactionId = randomId()
    return this
  }

  public generateDate(): this {
    this.date = Math.round(Date.now() / 1000)

    return this
  }

  public display() {
    return Object.freeze(new OrderDisplay(this))
  }
}

class OrderDisplay {
  constructor(order: Order) {
    this.date = order.date ? order.date.toString() : null
    this.transactionId = order.transactionId
    this.paymentType = order.paymentType
    this.address = !isEmpty(order.address) ? order.address : undefined
    this.deliveryAddress = !isEmpty(order.deliveryAddress) ? order.deliveryAddress : undefined
    this.message = order.message
    this.total = expandPrice(order.total)
    this.shippingCost = expandPrice(order.shippingCost)
    this.cart = order.cart.map(product => ({
      ...product,
      price: expandPrice(+product.price),
      total: expandPrice(+product.total)
    }))
  }

  readonly date: string | null
  readonly transactionId: string
  readonly paymentType: Order['paymentType']
  readonly address: Address | undefined
  readonly deliveryAddress: DeliveryAddress | undefined
  readonly message: string | undefined
  readonly total: ReturnType<typeof expandPrice>
  readonly shippingCost: ReturnType<typeof expandPrice>
  readonly cart: {
    price: {
      value: number
      formatted: string
    }
    total: {
      value: number
      formatted: string
    }
    id: number
    code: string
    name: string
    description: string
    quantity: number
  }[]
}

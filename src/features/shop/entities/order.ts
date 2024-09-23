import { Address } from './address.js'
import { fromUnixTime } from 'date-fns'
import { isEmpty, isNumber, pick } from 'lodash-es'
import { toUrlSlug } from '#utils/slugify.js'
import expandPrice from '#utils/expand-price.js'
import randomId from '#utils/random-id.js'

import type { ExpandedPrice } from '#utils/expand-price.js'
import type { Product } from './product.js'

type CartProduct = {
  id: number
  code: string
  name: string
  description: string
  price: number
  quantity: number
  total: number
}

export class Order {
  constructor(readonly module: number) {}

  public total = 0
  public shippingCost = 0
  public discount = 0
  public paymentType: 'paypal' | 'prepayment' = 'prepayment'
  private _message: string | null = null
  private _address = new Address()
  private _deliveryAddress: Address | null = null
  private _transactionId: string | null = null
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
   * Sets the message.
   * @param {string} message - The message to set.
   * @returns The current instance for chaining.
   */
  public set message(message: string | null | undefined) {
    this._message = message?.trim() || null
  }

  /**
   * Sets the transaction ID.
   * @param {string | number} id - The transaction ID to set.
   * @returns The current instance for chaining.
   */
  public set transactionId(id: string | number | null) {
    this._transactionId = id ? id.toString().toLowerCase() : null
  }

  /**
   * Sets the address.
   * @param {Address} address - The address to set.
   * @returns The current instance for chaining.
   */
  public set address(address: Partial<Address> | null | undefined) {
    if (!address) {
      this._address = new Address()
    } else {
      this._address.company = address.company
      this._address.salutation = address.salutation
      this._address.firstname = address.firstname
      this._address.name = address.name
      this._address.address = address.address
      this._address.zip = address.zip
      this._address.city = address.city
      this._address.email = address.email
      this._address.phone = address.phone
    }
  }

  /**
   * Sets the delivery address.
   * @param {DeliveryAddress | null} address - The delivery address to set.
   * @returns The current instance for chaining.
   */
  public set deliveryAddress(address: Partial<Address> | null | undefined) {
    if (!address) {
      this._deliveryAddress = null
    } else {
      this._deliveryAddress = new Address()
      this._deliveryAddress.company = address.company
      this._deliveryAddress.name = address.name
      this._deliveryAddress.address = address.address
      this._deliveryAddress.zip = address.zip
      this._deliveryAddress.city = address.city

      // Reset the delivery address if all fields are empty.
      if (!this._deliveryAddress.size) {
        this._deliveryAddress = null
      }
    }
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

  public get message() {
    return this._message
  }

  public get address(): Address {
    return this._address
  }

  public get deliveryAddress(): Address | null {
    return this._deliveryAddress
  }

  public get transactionId(): string | null {
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
    const address = this._address.display()

    if (address.name) {
      this._transactionId = toUrlSlug(address.name).substring(0, 4) + randomId()
    } else {
      this._transactionId = randomId('long')
    }

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
    this.date = order.date ? order.date.toISOString() : null
    this.transactionId = order.transactionId
    this.paymentType = order.paymentType
    this.address = order.address.display()
    this.deliveryAddress = order.deliveryAddress
      ? pick(order.deliveryAddress?.display(), ['company', 'name', 'address', 'zip', 'city'])
      : undefined
    this.message = order.message || undefined
    this.total = expandPrice(order.total)
    this.shippingCost = expandPrice(order.shippingCost)
    this.cart = order.cart.map(product => ({
      ...product,
      price: expandPrice(+product.price),
      total: expandPrice(+product.total)
    }))
  }

  readonly date: string | null
  readonly transactionId: string | null
  readonly paymentType: Order['paymentType']
  readonly address: { [k: string]: string | null }
  readonly deliveryAddress: { [k: string]: string | null } | undefined
  readonly message: string | undefined
  readonly total: ExpandedPrice
  readonly shippingCost: ExpandedPrice
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

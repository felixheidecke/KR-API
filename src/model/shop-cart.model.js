import { getProduct } from '#data/shop-product'
import { add, sortBy, tail } from 'lodash-es'
// import { v4 as uuid } from 'uuid'
// import redis from '#libs/redis'
import { NUMBER_FORMAT, NUMBER_FORMAT_CURRENCY } from '#constants'
import { sign, verify } from '#libs/jwt'
import { getAdditionalCost, getShippingCost } from '#data/shop-info'

export class ShopCart {
  #module = null
  #items = new Map()
  #itemCount = 0
  #net = 0
  #tax = 0
  #gross = 0
  #weight = 0
  #shippingCost = 0
  #additionalCost = 0
  #total = 0

  /**
   * save the cart to JWT token
   *
   * @returns {class} current cart instance
   */

  get token() {
    return sign(this.#returnCartAsString())
  }

  set token(token) {
    if (!token) return

    this.#setFromString(verify(token))
  }

  /**
   * return cart contents
   *
   * @return {object} uuid
   */

  get entries() {
    let items = Array.from(this.#items)
    items = items.map(([id, product]) => ({ id: +id, ...product }))
    items = sortBy(items, 'id')

    return {
      items,
      itemCount: this.#itemCount,
      weight: this.#weight,
      net: +this.#net.toFixed(4),
      tax: +this.#tax.toFixed(4),
      gross: +this.#gross.toFixed(4),
      shippingCost: this.#shippingCost,
      additionalCost: this.#additionalCost,
      total: this.#total
    }
  }

  /**
   * Increase the quantity of said product by one
   *
   * @param {number|string} id
   * @returns {Class} current cart instance
   */

  async addItem(id) {
    id = id.toString()
    const quantity = this.#items.get(id)?.quantity + 1 || 1

    await this.#setItem(id, quantity)
    await this.#calculate()

    return this
  }

  /**
   * set the quantity of said product
   *
   * @param {number|string} id
   * @returns {Class} current cart instance
   */

  async updateItem(id, quantity) {
    await this.#setItem(id.toString(), quantity)
    await this.#calculate()

    return this
  }

  /**
   * remove said product
   *
   * @param {number|string} id
   * @returns {class} current cart instance
   */

  async removeItem(id) {
    this.#items.delete(id.toString())
    await this.#calculate()

    return this
  }

  async initialise(module) {
    this.#module = +module
    this.#additionalCost = (await getAdditionalCost(this.#module)) || 0
  }

  // --- Private Methods -------------------------------------------------------

  async #setItem(id, quantity) {
    const product = await getProduct(id)

    if (!product || this.#module !== product.module) return

    const gross = product.price.value * quantity
    const net = gross / (product.tax.value / 100 + 1)
    const weight = product.weight.value * quantity

    this.#items.set(product.id.toString(), {
      product: {
        name: product.name,
        code: product.code,
        EAN: product.EAN,
        slug: product.slug
      },
      quantity,
      net: {
        value: +net.toFixed(4),
        formatted: NUMBER_FORMAT_CURRENCY.format(net)
      },
      gross: {
        value: gross,
        formatted: NUMBER_FORMAT_CURRENCY.format(gross)
      },
      weight: {
        value: weight,
        formatted: NUMBER_FORMAT.format(weight)
      }
    })
  }

  async #calculate() {
    // reset all values first
    this.#gross = 0
    this.#itemCount = 0
    this.#net = 0
    this.#shippingCost = 0
    this.#tax = 0
    this.#total = 0
    this.#weight = 0

    this.#items.forEach(({ net, gross, quantity, weight }) => {
      this.#gross = add(this.#gross, gross.value)
      this.#itemCount = add(this.#itemCount, quantity)
      this.#net = add(this.#net, net.value)
      this.#weight = add(this.#weight, weight.value)
    })

    this.#tax = this.#gross - this.#net
    this.#shippingCost = await getShippingCost(
      this.#module,
      this.#weight,
      this.#gross
    )
    this.#total = this.#gross + this.#additionalCost + this.#shippingCost
  }

  #returnCartAsString() {
    return JSON.stringify({
      gross: this.#gross,
      itemCount: this.#itemCount,
      items: Object.fromEntries(this.#items),
      net: this.#net,
      shippingCost: this.#shippingCost,
      tax: this.#tax,
      total: this.#total,
      weight: this.#weight
    })
  }

  #setFromString(data) {
    this.#gross = +data.gross
    this.#itemCount = +data.itemCount
    this.#items = new Map(Object.entries(data.items))
    this.#shippingCost = data.shippingCost
    this.#tax = data.tax
    this.#total = data.total
    this.#weight = data.weight
  }
}

import { Shop3CartProducts } from './cartProducts.model.js'
import { Shop3AdditionalCost } from './additionalCost.model.js'
import { Shop3ShippingCost } from './shippingCost.model.js'
import { NUMBER_FORMAT_CURRENCY } from '#constants'

export class Shop3Cart {
  #module = null // Shop ID

  #additionalCost = new Shop3AdditionalCost()
  #products = new Shop3CartProducts()
  #shippingCost = new Shop3ShippingCost()

  #gross = 0 // Across all Products
  #additional = null // Additional costs per order
  #shipping = null // Shipping cost
  #total = 0 // Product total + additional- & shipping costs

  constructor(module) {
    this.#module = module
  }

  /**
   * Add product to cart
   * @param {number} id product id
   */

  async addItem(id) {
    await this.#products.addProduct(id, this.#module)

    return this
  }

  /**
   * Update a products quantity in the cart
   * @param {number} id product id
   * @param {number} amount quantity
   */

  async updateItem(id, amount) {
    await this.#products.updateProduct(id, this.#module, amount)

    return this
  }

  /**
   * Remove item from cart
   * @param {number} id product id
   */

  async removeItem(id) {
    await this.#products.removeProduct(id)

    return this
  }

  /**
   * export raw cart
   * @returns {object} full shopping cart
   */

  get export() {
    return {
      module: this.#module,
      products: this.#products.getAll().map(({ product, quantity, total }) => {
        return {
          id: product.id,
          name: product.base.name,
          code: product.base.code,
          price: product.getPrice().value,
          quantity,
          total
        }
      }),
      gross: this.#gross,
      additional: this.#additional,
      shipping: this.#shipping,
      total: this.#total
    }
  }

  hasItems() {
    return this.#products.hasProducts()
  }

  /**
   * export formatted/enriched cart
   * @returns {object} full shopping cart
   */

  getProducts() {
    return this.#products.getAll().map(({ product, quantity, total }) => ({
      ...product.base,
      price: product.getPrice(),
      quantity: quantity,
      total: expandPrice(total)
    }))
  }

  getGross() {
    return expandPrice(this.#gross)
  }

  getAdditionalCost() {
    if (!this.#additional) return null

    return {
      ...expandPrice(this.#additional),
      title: this.#additionalCost.getTitle()
    }
  }

  getShippingCost() {
    if (!this.#shipping) return null

    return expandPrice(this.#shipping)
  }

  getTotal() {
    return expandPrice(this.#total)
  }

  getAll() {
    return {
      products: this.getProducts(),
      gross: this.getGross(),
      additional: this.getAdditionalCost(),
      shipping: this.getShippingCost(),
      total: this.getTotal()
    }
  }

  /**
   * (re-)calculate cart
   * @return {class} this
   */

  async calculate() {
    this.#additional = null
    this.#gross = 0
    this.#shipping = null
    this.#total = 0

    let weight = 0

    // --- Add up product price and weight -------------------------------------

    this.#products.getAll().forEach(({ total, weight }) => {
      this.#gross += total
      weight += weight
    })

    this.#gross = +this.#gross.toFixed(2) // fix rounding error
    this.#total = this.#gross

    // --- Add additional cost if any ------------------------------------------

    await this.#additionalCost.fetch(this.#module)

    if (this.#additionalCost.hasCost()) {
      this.#additional = this.#additionalCost.getAmount()
      this.#total += this.#additional
    }

    // --- Add shipping cost if any --------------------------------------------

    await this.#shippingCost.fetch(this.#module)

    if (this.#shippingCost.hasRateByWeight(weight)) {
      this.#shipping = this.#shippingCost.getCostByWeight(weight)
      this.#total += this.#shipping
    }

    this.#total = +this.#total.toFixed(2) // fix rounding error

    return this
  }
}

function expandPrice(price) {
  if (!price) return

  return {
    value: price,
    formatted: NUMBER_FORMAT_CURRENCY.format(price)
  }
}

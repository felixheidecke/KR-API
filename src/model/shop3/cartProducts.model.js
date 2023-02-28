import { Shop3Product } from './product.model.js'

export class Shop3CartProducts {
  #products = new Map()

  /**
   * Return raw data
   * @returns {Map} Map of all products
   */

  get export() {
    return Object.freeze(this.#products)
  }

  /**
   * Return a single producs
   * @param {number} id product id
   * @returns {object} product
   */

  get(id) {
    if (!this.#products.has(id)) return

    return this.#products.get(id)
  }

  /**
   * Return all producs
   * @returns {Class[]} List of all products
   */

  getAll() {
    return Array.from(this.#products).map(([_, value]) => value)
  }

  /**
   * Increase the quantity of said product by one
   * @param {Number|String} id
   * @returns {Class} current cart instance
   */

  async addProduct(id, module) {
    id = id.toString()
    const quantity = this.#products.get(id)?.quantity + 1 || 1

    await this.#setProduct(id, module, quantity)

    return this
  }

  /**
   * set the quantity of said product
   * @param {number|string} id
   * @returns {Class} current cart instance
   */

  async updateProduct(id, module, quantity) {
    await this.#setProduct(id.toString(), module, quantity)

    return this
  }

  /**
   * remove said product
   * @param {number|string} id
   * @returns {class} current cart instance
   */

  async removeProduct(id) {
    this.#products.delete(id.toString())

    return this
  }

  async #setProduct(id, module, quantity = 1) {
    const product = await new Shop3Product().fetch(id, module)

    if (!product.exists()) return

    const total = product.getPrice().value * quantity
    const weight = product.getWeight().value * quantity
    const item = {
      product,
      quantity,
      total,
      weight
    }

    this.#products.set(id.toString(), item)
    return item
  }
}

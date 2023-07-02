import expandPrice from '#utils/expand-price'
import ShopAdditionalCost from './shopAdditionalCost.js'
import ShopProduct from './shopProductModel.js'
import ShopShippingCost from './shopShippingCostModel.js'

export default class ShopCart {
  #module
  #isCalculated

  // Data
  #gross = 0
  #total = 0
  #products = new Map()
  #shipping = 0
  #additionalCost = {}

  /**
   * Initialise
   *
   * @param {number} module
   */

  constructor(module) {
    if (!module) {
      throw new Error('Missing required parameter "module"')
    }

    this.#module = module
    this.#isCalculated = false
  }

  get gross() {
    return expandPrice(this.#gross)
  }

  get total() {
    return expandPrice(this.#total)
  }

  get shipping() {
    return expandPrice(this.#shipping)
  }

  get additionalCost() {
    const { amount, title } = this.#additionalCost

    if (!amount) return undefined

    return {
      title,
      ...expandPrice(amount)
    }
  }

  get products() {
    return Array.from(this.#products).map(([_, product]) => ({
      ...product,
      price: expandPrice(product.price),
      total: expandPrice(product.total)
    }))
  }

  get hasProducts() {
    return !!this.#products.size
  }

  get isCalculated() {
    return this.#isCalculated
  }

  get data() {
    return {
      module: this.#module,
      gross: this.gross,
      shipping: this.shipping,
      additionalCost: this.additionalCost,
      total: this.total,
      products: this.products,
      weight: this.weight
    }
  }

  /**
   * Add product to cart
   * @param {number} id product id
   */

  async addItem(id) {
    let quantity = this.#products.get(id)?.quantity + 1 || 1

    await this.updateItemQuantity(id, quantity)

    this.#isCalculated = false

    return this
  }

  /**
   * Update a products quantity in the cart
   * @param {number} id product id
   * @param {number} quantity
   */

  async updateItemQuantity(id, quantity) {
    if (quantity === 0) {
      this.removeItem(id)
      return this
    }

    const product = new ShopProduct(id, this.#module)

    await product.load()

    if (product.id) {
      this.#products.set(id, {
        id: product.id,
        name: product.name,
        code: product.code,
        quantity,
        weight: (product.weight?.value || 0) * quantity,
        price: product.price.value,
        total: product.price.value * quantity
      })

      this.#isCalculated = false
    }

    return this
  }

  /**
   * Remove item from cart
   * @param {number} id product id
   */

  async removeItem(id) {
    if (this.#products.has(id)) {
      this.#products.delete(id)
    }

    this.#isCalculated = false

    return this
  }

  /**
   * (re-)calculate cart
   * @return {class} this
   */

  async calculate() {
    if (this.#isCalculated) return

    const additionalCost = new ShopAdditionalCost(this.#module)
    const shippingCost = new ShopShippingCost(this.#module)

    if (this.hasProducts) {
      await Promise.all([additionalCost.load(), shippingCost.load()])
    }

    let gross = 0
    let shipping = 0
    let additional = {}
    let total = 0
    let weight = 0

    // Add up product price and weight
    this.#products.forEach((product) => {
      gross += product.total
      weight += product.weight
    })

    gross = +gross.toFixed(2) // fix rounding error
    total = gross

    if (additionalCost.amount.value) {
      additional = additionalCost.export()
      total += additionalCost.amount.value ?? 0
    }

    //  Add shipping cost if any
    if (shippingCost.hasRateByWeight(weight)) {
      shipping = shippingCost.getRateByWeight(weight)?.price || 0
      total += shipping
    }

    this.#gross = +gross.toFixed(2)
    this.#shipping = +shipping.toFixed(2)
    this.#total = +total.toFixed(2)
    this.#additionalCost = additional
    this.#isCalculated = true
  }

  export() {
    return {
      additionalCost: this.#additionalCost,
      gross: this.#gross,
      isCalculated: this.#isCalculated,
      module: this.#module,
      products: Array.from(this.#products),
      shipping: this.#shipping,
      total: this.#total
    }
  }

  import(data) {
    this.#additionalCost = data.additionalCost
    this.#gross = data.gross
    this.#isCalculated = data.isCalculated
    this.#products = new Map()
    this.#shipping = data.shipping
    this.#total = data.total

    data.products.forEach(([id, product]) => this.#products.set(id, product))

    return this
  }
}

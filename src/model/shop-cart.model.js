import { getProductWithModule } from '#data/shop-product'
import { sortBy } from 'lodash-es'
import { NUMBER_FORMAT_CURRENCY } from '#constants'
import { sign, verify } from '#libs/jwt'
import database from '#libs/database'

// private classes do not return this, but specific data
//

export class ShopCart {
  #module = null
  #items = new Map()

  /**
   * get carts JWT token
   *
   * @returns {string} token
   */

  get token() {
    return sign(
      JSON.stringify({
        module: this.#module,
        items: Object.fromEntries(this.#items)
      })
    )
  }

  set token(token) {
    if (!token) return

    try {
      token = verify(token)

      this.#module = +token.module
      this.#items = new Map(Object.entries(token.items))
    } catch (error) {
      throw error
    }
  }

  set module(module) {
    this.reset()

    this.#module = +module
  }

  get module() {
    return this.#module
  }

  /**
   * return cart contents
   *
   * @return {object} uuid
   */

  async get() {
    let items = Array.from(this.#items)
    items = items.map(([id, product]) => ({
      id: +id,
      ...product,
      gross: expandPrice(product.gross)
    }))
    items = sortBy(items, 'id')

    return {
      items,
      ...(await this.#calculateCart())
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

    return this
  }

  reset() {
    this.#items = new Map()

    return this
  }

  async #setItem(id, quantity) {
    const product = await getProductWithModule(id, this.#module)

    if (!product) {
      this.reset()
      return
    }

    const gross = product.price.value * quantity
    const weight = product.weight.value * quantity
    const item = {
      product: {
        name: product.name,
        code: product.code,
        EAN: product.EAN,
        slug: product.slug,
        price: product.price
      },
      quantity,
      gross,
      weight
    }

    this.#items.set(product.id.toString(), item)
    return item
  }

  async #calculateCart() {
    let gross = 0
    let itemCount = 0
    let weight = 0

    // Add up product values
    this.#items.forEach((item) => {
      gross += item.gross
      itemCount += item.quantity
      weight += item.weight
    })

    const additionalCost = await getAdditionalCost(this.#module)
    const shippingCost = await this.#getShippingCost(weight)
    let total = gross

    if (additionalCost) total += additionalCost.value

    if (shippingCost) total += shippingCost.value

    return {
      itemCount,
      gross: expandPrice(gross),
      shippingCost,
      additionalCost,
      total: expandPrice(total)
    }
  }

  async #getShippingCost(weight) {
    const query = `
        SELECT    w.charge as price, s.freeFrom as threshold
        FROM      rtd.Shop3ShippingCharges AS s
        JOIN      rtd.Shop3ShippingChargesWeight AS w ON s._id = w.charges
        WHERE     s.module = ?
        AND       w.upToWeight > ?
        ORDER BY  w.upToWeight ASC
        LIMIT     1`

    const [rows] = await database.execute(query, [this.#module, weight])

    const { price, threshold } = rows[0]

    const value = threshold && price < threshold ? price : 0

    return value ? expandPrice(value) : null
  }
}

const getAdditionalCost = async (module) => {
  const query = `
      SELECT    s.extracostAmount as additionalCost,
                s.extracostTitle as additionalCostTitle
      FROM      rtd.Shop3ShippingCharges AS s
      JOIN      rtd.Shop3ShippingChargesWeight AS w ON s._id = w.charges
      WHERE     s.module = ?
      LIMIT     1`

  const [rows] = await database.execute(query, [module])

  if (!rows.length) return

  const { additionalCost, additionalCostTitle } = rows[0]

  return additionalCost
    ? {
        ...expandPrice(additionalCost),
        title: additionalCostTitle
      }
    : null
}

const expandPrice = (price) => {
  if (!price) return

  return {
    value: price,
    formatted: NUMBER_FORMAT_CURRENCY.format(price)
  }
}

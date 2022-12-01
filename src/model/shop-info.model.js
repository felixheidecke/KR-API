import { SHOP_UNIT } from '#constants'

export class Shop {
  #module
  #shippingCharges = null
  #shippingRates = []

  constructor(module) {
    this.#module = +module // Shop module rtd.Shop3Product[module]
  }

  async getShippingCharges() {
    if (Object.keys(this.#shippingCharges).length) {
      return this.#shippingCharges
    }

    await this.#setShippingCharges()
    return this.#shippingCharges
  }

  async getShippingRates() {
    if (this.#shippingCharges) {
      return this.#shippingCharges
    }

    await this.#setShippingCharges()
    return this.#shippingCharges
  }

  // --- Private ----

  /**
   * Set the shipping charges
   *
   * @returns {Prmose<void>}
   */

  async #setShippingCharges() {
    const query = `
    SELECT *
    FROM   rtd.Shop3ShippingCharges
    WHERE  module = ?`

    const [rows] = await database.execute(query, [this.#module])

    if (!rows.length) return null

    this.#shippingCharges = shippingChargesAdapter(rows[0])
  }

  async #setShippingRates() {
    const query = `
      SELECT w.upToWeight as weight, w.charge as price
      FROM   rtd.Shop3ShippingCharges as s
      JOIN   rtd.Shop3ShippingChargesWeight as w ON s._id = w.charges
      WHERE  s.module = ?`

    const [rows] = await database.execute(query, [this.#module])

    if (!rows.length) return []

    return rows.map(shippingRateAdapter)
  }
}

// Helper

const shippingRateAdapter = (rate) => {
  const { weight, price } = rate

  return {
    weight: {
      value: weight,
      formatted: NUMBER_FORMAT.format(weight) + ' ' + SHOP_UNIT.kg
    },
    price: {
      value: price,
      formatted: NUMBER_FORMAT_CURRENCY.format(price)
    }
  }
}

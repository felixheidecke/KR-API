import { SHOP_UNIT } from '#constants'

export class Shop {
  constructor(module) {
    this._module = +module // Shop module rtd.Shop3Product[module]
    this._shippingCharges = null
    this._shippingRates = []
  }

  async getShippingCharges() {
    if (Object.keys(this._shippingCharges).length) {
      return this._shippingCharges
    }

    await this._setShippingCharges()
    return this._shippingCharges
  }

  async getShippingRates() {
    if (this._shippingCharges) {
      return this._shippingCharges
    }

    await this._setShippingCharges()
    return this._shippingCharges
  }

  // --- Private ----

  /**
   * Set the shipping charges
   *
   * @returns {Prmose<void>}
   */

  async _setShippingCharges() {
    const query = `
    SELECT *
    FROM   rtd.Shop3ShippingCharges
    WHERE  module = ?`

    const [rows] = await database.execute(query, [this._module])

    if (!rows.length) return null

    this._shippingCharges = shippingChargesAdapter(rows[0])
  }

  async _setShippingRates() {
    const query = `
      SELECT w.upToWeight as weight, w.charge as price
      FROM   rtd.Shop3ShippingCharges as s
      JOIN   rtd.Shop3ShippingChargesWeight as w ON s._id = w.charges
      WHERE  s.module = ?`

    const [rows] = await database.execute(query, [this._module])

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

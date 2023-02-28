import database from '#libs/database'

export class Shop3ShippingCost {
  #data = null

  /**
   * @returns {object} full shipping cost object
   */

  get export() {
    return Object.freeze(this.#data)
  }

  /**
   * fetch the shipping costs for shop
   *
   * @param {number} module (shop id)
   * @returns {class} this
   */

  async fetch(module) {
    if (!module) throw 'Missing required attribute {number} "module"'

    await this.#fetchShippingCost(module)

    return this
  }

  /**
   * Check if weight has corresponding rate
   *
   * @param {number} weight
   * @returns {boolean}
   */

  hasRateByWeight(weight) {
    const { rates } = this.#data

    return !!rates.find((rate) => rate.threshold > weight)
  }

  /**
   * get the shipping rate based on weight
   *
   * @param {number} weight
   * @returns {object} { price, threshold }
   */

  getRateByWeight(weight) {
    const { rates } = this.#data

    return rates.find((rate) => rate.threshold > weight)
  }

  /**
   * get the shipping cost based on weight
   *
   * @param {number} weight
   * @returns {number} price
   */

  getCostByWeight(weight) {
    return this.getRateByWeight(weight)?.price
  }

  /**
   * get the next threshold based on weight
   *
   * @param {number} weight
   * @returns {number} threshold
   */

  getThresholdByWeight(weight) {
    return this.getRateByWeight(weight)?.threshold
  }

  /**
   * get the price threshold for free shipping
   *
   * @returns {number} freeShippingPriceThreshold
   */

  getFreeShippingPriceThreshold() {
    return this.#data.freeShippingPriceThreshold
  }

  /**
   * Fetch all rates and freeShippingPriceThreshold
   *
   * @returns {object} shipping cost
   */

  async #fetchShippingCost(module) {
    const query = `
      SELECT   w.charge as price, w.upToWeight as threshold,
               s.freeFrom as freeShippingPriceThreshold
      FROM     rtd.Shop3ShippingCharges AS s
      JOIN     rtd.Shop3ShippingChargesWeight AS w ON s._id = w.charges
      WHERE    s.module = ?
      ORDER BY w.upToWeight ASC`

    const [rows] = await database.execute(query, [module])

    if (!rows.length) {
      this.#data = {
        rates: [],
        freeShippingPriceThreshold: null
      }
    } else {
      this.#data = {
        rates: rows.map(({ price, threshold }) => ({ price, threshold })),
        freeShippingPriceThreshold: rows[0].freeShippingPriceThreshold || null
      }
    }

    return this.#data
  }
}

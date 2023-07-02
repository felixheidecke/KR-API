import database from '#libs/database'
import expandPrice from '#utils/expand-price'

export default class ShopShippingCost {
  #module

  // Data
  #rates = []
  #freeFrom = null
  #unit = ''

  constructor(module = 0) {
    this.#module = module
  }

  get freeShippingThreshold() {
    return this.#freeFrom
  }

  get unit() {
    return this.#unit
  }

  get rates() {
    return this.#rates.map(({ threshold, price }) => ({
      price: expandPrice(price),
      threshold
    }))
  }

  get data() {
    return {
      rates: this.rates,
      freeFrom: this.threshold,
      unit: this.unit
    }
  }

  /**
   * Check if weight has corresponding rate
   *
   * @param {number} weight
   * @returns {boolean}
   */

  hasRateByWeight(weight) {
    return !!this.getRateByWeight(weight)
  }

  /**
   * get the shipping rate based on weight
   *
   * @param {number} weight
   * @returns {object} { price, threshold }
   */

  getRateByWeight(weight) {
    return this.#rates.find((rate) => rate.threshold > weight)
  }

  /**
   * get the next threshold based on weight
   *
   * @param {number} weight
   * @returns {number} threshold
   */

  getThresholdByWeight(weight) {
    console.log(`getThresholdByWeight(${weight})`)

    return this.getRateByWeight(weight)?.threshold
  }

  async load() {
    const shippingCost = await ShopShippingCost.fetchShippingCost(this.#module)

    if (!shippingCost) return

    const { rates, freeFrom, unit } = shippingCost
    this.#rates = rates || []
    this.#freeFrom = freeFrom || null
    this.#unit = unit || ''
  }

  static async fetchShippingCost(module) {
    const query = `
      SELECT
        weight.charge AS price,
        weight.upToWeight AS threshold,
        charges.freeFrom,
        attr.value AS unit
      FROM
        rtd.Shop3ShippingCharges AS charges
      JOIN
        rtd.Shop3ShippingChargesWeight AS weight
      ON
        charges._id = weight.charges
      JOIN
        rtd.ModuleAttribute AS attr
      ON
        attr.module = ${module} AND attr.name = 'shipping.unit'
      WHERE
        charges.module = ${module}
      ORDER BY
        weight.upToWeight ASC`

    const [rows] = await database.execute(query)

    if (!rows.length) return

    return {
      rates: rows.map(({ price, threshold }) => ({ price, threshold })),
      freeFrom: rows[0].freeFrom || null,
      unit: rows[0].unit || null
    }
  }
}

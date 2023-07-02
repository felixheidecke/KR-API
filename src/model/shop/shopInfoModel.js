import { NUMBER_FORMAT, NUMBER_FORMAT_CURRENCY, SHOP_UNIT } from '#constants'
import database from '#libs/database'
import textile from 'textile-js'
import ShopShippingCost from './shopShippingCostModel.js'

export default class ShopInfo {
  #module

  // Data
  #shippingCharges = {}
  #shippingRates = {}

  constructor(module = 0) {
    this.#module = module
  }

  get shippingCharges() {
    if (!this.#shippingCharges.extracostAmount) return

    const { text, freeFrom, extracostAmount, extracostTitle } =
      this.#shippingCharges

    return {
      description: text ? textile.parse(text) : undefined,
      freeShippingThreshold: freeFrom
        ? {
            value: freeFrom,
            formatted: NUMBER_FORMAT_CURRENCY.format(freeFrom)
          }
        : undefined,
      additionalCost: extracostAmount
        ? {
            value: extracostAmount,
            formatted: NUMBER_FORMAT_CURRENCY.format(extracostAmount),
            title: extracostTitle.trim() || ''
          }
        : undefined
    }
  }

  get shippingRates() {
    if (!'rates' in this.#shippingRates) return

    return this.#shippingRates?.rates.map(({ threshold, price }) => {
      return {
        weight: {
          value: threshold,
          formatted:
            NUMBER_FORMAT.format(threshold) + ' ' + this.#shippingRates.unit ||
            SHOP_UNIT.kg
        },
        price: {
          value: price,
          formatted: NUMBER_FORMAT_CURRENCY.format(price)
        }
      }
    })
  }

  get data() {
    return {
      shippingCharges: this.shippingCharges,
      shippingRates: this.shippingRates
    }
  }

  async load() {
    const [shippingCharges, shippingRates] = await Promise.all([
      ShopInfo.fetchShippingCharges(this.#module),
      ShopShippingCost.fetchShippingCost(this.#module)
    ])

    this.#shippingCharges = shippingCharges || {}
    this.#shippingRates = shippingRates || {}

    return this
  }

  /**
   * Set the shipping charges
   *
   * @returns {Prmoise<void>}
   */

  static async fetchShippingCharges(module) {
    const query = `
      SELECT
        freeFrom,
        extracostAmount,
        extracostTitle,
        TEXT
      FROM
        rtd.Shop3ShippingCharges
      WHERE
        module = ${module}
      LIMIT 1`

    const [rows] = await database.execute(query)

    return rows.length ? rows[0] : null
  }
}

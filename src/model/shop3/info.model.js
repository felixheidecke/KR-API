import { NUMBER_FORMAT, NUMBER_FORMAT_CURRENCY, SHOP_UNIT } from '#constants'
import database from '#libs/database'
import textile from 'textile-js'

export class Shop3Info {
  #module = null

  set module(module) {
    this.#module = +module
  }

  async shippingCharges() {
    const { text, freeFrom, extracostAmount, extracostTitle } =
      await this.#fetchShippingCharges()

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

  async shippingRates() {
    const shippingRates = await this.#fetchShippingRates()

    return shippingRates.map(({ weight, price }) => {
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
    })
  }

  async credentials() {
    const { paypal_client_id, paypal_secret } = await this.#getCredentials()

    return {
      paypal: paypal_client_id
        ? {
            clientId: paypal_client_id,
            secret: paypal_secret
          }
        : null
    }
  }

  async owner() {
    return await this.#fetchOwner()
  }

  /**
   * Set the shipping charges
   *
   * @returns {Prmoise<void>}
   */

  async #fetchShippingCharges() {
    const query = `
    SELECT freeFrom, extracostAmount, extracostTitle, text
    FROM   rtd.Shop3ShippingCharges
    WHERE  module = ?
    LIMIT  1`

    const [rows] = await database.execute(query, [this.#module])

    if (!rows.length) return null

    return rows[0]
  }

  async #fetchShippingRates() {
    const query = `
      SELECT   w.upToWeight as weight, w.charge as price
      FROM     rtd.Shop3ShippingCharges as s
      JOIN     rtd.Shop3ShippingChargesWeight as w ON s._id = w.charges
      WHERE    s.module = ?
      ORDER BY weight ASC`

    const [rows] = await database.execute(query, [this.#module])

    if (!rows.length) return []

    return rows
  }

  async #fetchOwner() {
    const query = `
      SELECT c.name, c.web, c.email, c.phone, c.address, c.city, c.zip
      FROM   rtd.Module AS m
      JOIN   rtd.Customer AS c ON m.owner = c._id
      WHERE  m._id = ?
      LIMIT  1`

    const [rows] = await database.execute(query, [this.#module])

    if (!rows.length) return null

    return rows[0]
  }

  async #getCredentials() {
    const query = `
      SELECT paypal_client_id, paypal_secret
      FROM   rtd.Shop3Credentials
      WHERE  module = ?
      LIMIT  1`

    const [rows] = await database.execute(query, [this.#module])

    if (!rows.length) return null

    return rows[0]
  }
}

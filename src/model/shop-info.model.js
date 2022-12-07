import { NUMBER_FORMAT, NUMBER_FORMAT_CURRENCY, SHOP_UNIT } from '#constants'
import database from '#libs/database'
import textile from 'textile-js'

export class Shop {
  #module = null

  set module(module) {
    this.#module = +module
  }

  get shippingCharges() {
    return this.#getShippingCharges()
  }

  get shippingRates() {
    return this.#getShippingRates()
  }

  get credentials() {
    return this.#getCredentials()
  }

  get owner() {
    return this.#getOwner()
  }

  /**
   * Set the shipping charges
   *
   * @returns {Prmose<void>}
   */

  async #getShippingCharges() {
    const query = `
    SELECT freeFrom, extracostAmount, extracostTitle, text
    FROM   rtd.Shop3ShippingCharges
    WHERE  module = ?`

    const [rows] = await database.execute(query, [this.#module])

    if (!rows.length) return null

    return shippingChargesAdapter(rows[0])
  }

  async #getShippingRates() {
    const query = `
      SELECT   w.upToWeight as weight, w.charge as price
      FROM     rtd.Shop3ShippingCharges as s
      JOIN     rtd.Shop3ShippingChargesWeight as w ON s._id = w.charges
      WHERE    s.module = ?
      ORDER BY weight ASC`

    const [rows] = await database.execute(query, [this.#module])

    if (!rows.length) return []

    return rows.map(shippingRateAdapter)
  }

  async #getOwner() {
    const query = `
      SELECT c.name, c.web, c.email, c.phone, c.address, c.city, c.zip
      FROM   rtd.Module AS m
      JOIN   rtd.Customer AS c ON m.owner = c._id
      WHERE  m._id = ?`

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

    return credentialsAdapter(rows[0])
  }
}

// Helper

const shippingRateAdapter = ({ weight, price }) => {
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

const credentialsAdapter = ({ paypal_client_id, paypal_secret }) => {
  return {
    paypal: paypal_client_id
      ? {
          clientId: paypal_client_id,
          secret: paypal_secret
        }
      : null
  }
}

const shippingChargesAdapter = (data) => {
  return {
    description: data.text ? textile.parse(data.text) : undefined,
    freeShippingThreshold: data.freeFrom
      ? {
          value: data.freeFrom,
          formatted: NUMBER_FORMAT_CURRENCY.format(data.freeFrom)
        }
      : undefined,
    additionalCost: data.extracostAmount
      ? {
          value: data.extracostAmount,
          formatted: NUMBER_FORMAT_CURRENCY.format(data.extracostAmount),
          title: data.extracostTitle.trim() || ''
        }
      : undefined
  }
}

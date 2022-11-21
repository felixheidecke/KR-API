import database from '#libs/database'
import {
  NUMBER_FORMAT,
  NUMBER_FORMAT_CURRENCY,
  SHOP_UNIT
} from '#utils/constants'
import textile from 'textile-js'

/**
 * Fetch shipping info
 *
 * @param {number} id module
 * @returns {Promise<object|null>}
 */

export const getShippingCharges = async (module) => {
  const query = `
    SELECT *
    FROM   rtd.Shop3ShippingCharges
    WHERE  module = ?`

  const [rows] = await database.execute(query, [module])

  if (!rows.length) return null

  return shippingChargesAdapter(rows[0])
}

export const getShippingRates = async (module) => {
  const query = `
    SELECT w.upToWeight as weight, w.charge as price
    FROM   rtd.Shop3ShippingCharges as s
    JOIN   rtd.Shop3ShippingChargesWeight as w ON s._id = w.charges
    WHERE  s.module = ?`

  const [rows] = await database.execute(query, [module])

  if (!rows.length) return []

  return rows.map(shippingRateAdapter)
}

export const getOwnerInfo = async (module) => {
  const query = `
    SELECT c.name, c.web, c.email, c.phone, c.address, c.city, c.zip
    FROM   rtd.Module AS m
    JOIN   rtd.Customer AS c ON m.owner = c._id
    WHERE  m._id = ?`

  const [rows] = await database.execute(query, [module])

  if (!rows.length) return null

  return rows[0]
}

export const getCredentials = async (module) => {
  const query = `
    SELECT paypal_client_id, paypal_secret
    FROM   rtd.Shop3Credentials
    WHERE  module = ?
    LIMIT  1`

  const [rows] = await database.execute(query, [module])

  if (!rows.length) return null

  return credentialsAdapter(rows[0])
}

// Helper

const credentialsAdapter = (credentials) => {
  const { paypal_client_id, paypal_secret, jwt_secret } = credentials

  return {
    paypal: paypal_client_id
      ? {
          clientId: paypal_client_id,
          secret: paypal_secret
        }
      : null,
    jwtSecret: jwt_secret
  }
}

const shippingChargesAdapter = (charges) => {
  const { extracostAmount, extracostTitle, freeFrom, text } = charges

  return {
    info: text ? textile.parse(text) : null,
    additionalCost: extracostAmount
      ? {
          title: extracostTitle,
          value: extracostAmount,
          formatted: NUMBER_FORMAT_CURRENCY.format(extracostAmount)
        }
      : null,
    freeShippingThreshold: freeFrom
      ? {
          value: freeFrom,
          formatted: NUMBER_FORMAT_CURRENCY.format(freeFrom)
        }
      : null
  }
}

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

export const helper = {
  credentialsAdapter,
  shippingChargesAdapter,
  shippingRateAdapter
}

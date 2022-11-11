import database from '#libs/database'
import { credentialsAdapter } from '../_utils.js'

/**
 * Fetch shipping info
 *
 * @param {number} id module
 * @returns {Promise<object|null>}
 */

export const getShippingCharges = async (module) => {
  const query = `
    SELECT
      *
    FROM
      rtd.Shop3ShippingCharges
    WHERE
      module = ?`

  try {
    const [rows] = await database.execute(query, [module])

    if (!rows.length) return null

    return rows[0]
  } catch (error) {
    console.error(error)
    return error
  }
}

export const getShippingRates = async (module) => {
  const query = `
    SELECT
      w.upToWeight as weight, w.charge as price
    FROM
      rtd.Shop3ShippingCharges as s
    JOIN
      rtd.Shop3ShippingChargesWeight as w ON s._id = w.charges
    WHERE
      s.module = ?`

  try {
    const [rows] = await database.execute(query, [module])

    if (!rows.length) return []

    return rows
  } catch (error) {
    console.error(error)
    return error
  }
}

export const getOwnerInfo = async (module) => {
  const query = `
    SELECT
      c.name, c.web, c.email, c.phone, c.address, c.city, c.zip
    FROM
      rtd.Module AS m
    JOIN
      rtd.Customer AS c ON m.owner = c._id
    WHERE
      m._id = ?`

  try {
    const [rows] = await database.execute(query, [module])

    if (!rows.length) return null

    return rows[0]
  } catch (error) {
    console.error(error)
    return error
  }
}

export const getCredentials = async (module) => {
  const query = `
    SELECT
      paypal_client_id, paypal_secret
    FROM
      rtd.Shop3Credentials
    WHERE
      module = ?
    LIMIT
      1`

  try {
    const [rows] = await database.execute(query, [module])

    if (!rows.length) return null

    return credentialsAdapter(rows[0])
  } catch (error) {
    console.error(error)
    return error
  }
}

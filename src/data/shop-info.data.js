import database from '#libs/database'
import {
  credentialsAdapter,
  shippingCostAdapter,
  shippingRateAdapter
} from '#utils/shop-info'

export const getShippingCost = async (module, weight, gross) => {
  const query = `
    SELECT    w.charge as cost, s.freeFrom as threshold
    FROM      rtd.Shop3ShippingCharges AS s
    JOIN      rtd.Shop3ShippingChargesWeight AS w ON s._id = w.charges
    WHERE     s.module = ?
    AND       w.upToWeight > ?
    ORDER BY  w.upToWeight ASC
    LIMIT     1`

  const [rows] = await database.execute(query, [module, weight])

  return shippingCostAdapter(rows[0], gross)
}

export const getAdditionalCost = async (module) => {
  const query = `
    SELECT    s.extracostAmount as additionalCost,
              s.extracostTitle as additionalCostTitle
    FROM      rtd.Shop3ShippingCharges AS s
    JOIN      rtd.Shop3ShippingChargesWeight AS w ON s._id = w.charges
    WHERE     s.module = ?
    LIMIT     1`

  const [rows] = await database.execute(query, [module])

  if (!rows.length) return null

  return rows[0]
}

export const getShippingRates = async (module) => {
  const query = `
    SELECT    w.upToWeight as weight, w.charge as price, a.value as altWeight
    FROM      rtd.Shop3ShippingCharges as s
    JOIN      rtd.Shop3ShippingChargesWeight as w ON s._id = w.charges
    LEFT JOIN rtd.ModuleAttribute AS a ON s.module = a.module
              AND a.name = 'shipping.unit'
    WHERE     s.module = ?
    ORDER BY  w.upToWeight ASC`

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

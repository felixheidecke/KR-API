import database from '#libs/database'
import { productAdapter } from '#utils/shop-product'

/**
 * get Products from rtd.Shop3Product
 *
 * @param {number|string} id module
 * @returns {Promise<array>}
 */

export const getProducts = async (id, options = {}) => {
  const limit = options.limit || 9999

  const query = baseQuery(`
    WHERE    p.active = 1
    AND      p.module = ?
    ORDER BY p.priority ASC
    LIMIT    ?`)

  const [rows] = await database.execute(query, [id, limit])

  if (!rows.length) return []

  return rows.map(productAdapter)
}

/**
 * get Product from rtd.Shop3Product
 *
 * @param {number|string} id _id
 * @returns {Promise<object|null>}
 */

export const getProduct = async (id) => {
  const query = baseQuery('WHERE p._id = ?')

  const [rows] = await database.execute(query, [id])

  if (!rows.length) return null

  return productAdapter(rows[0])
}

/**
 * get Product price from rtd.Shop3Product
 *
 * @param {number|string} id _id
 * @returns {Promise<object|null>}
 */

export const getReducedProduct = async (id) => {
  const query = `
    SELECT
      _id as id, module, name, productCode as code, ean as EAN, price, tax
    FROM
      rtd.Shop3Product
    WHERE
      _id = ?
    LIMIT
      1`

  const [rows] = await database.execute(query, [id])

  if (!rows.length) return null

  return rows[0]
}

/**
 * get Product price from rtd.Shop3Product
 *
 * @param {number|string} id group
 * @returns {Promise<array>}
 */

export const getProductsByCategory = async (id) => {
  const query = baseQuery('WHERE p.group = ?')

  const [rows] = await database.execute(query, [id])

  if (!rows.length) return []

  return rows.map(productAdapter)
}

// --- [ Helper ] --------------------------------------------------------------

const baseQuery = (extension = '') => {
  return `
    SELECT    p._id, p.module, p.name, p.productCode, p.ean, p.frontpage,
              p.description, p.teaser, p.legal, p.price,
              p.tax, p.image, p.imageBig, p.pdf,
              p.pdfName, p.pdfTitle, p.weight, c.defaultWeight,
              p.quantity, c.defaultQuantity, p.unit, a.value as altWeight,
              c.defaultUnit, p.group AS categoryId,
              c.name AS categoryName
    FROM      rtd.Shop3Product AS p
    LEFT JOIN rtd.Shop3Group AS c ON p.group = c._id
    LEFT JOIN rtd.ModuleAttribute AS a ON p.module = a.module
              AND a.name = 'shipping.unit'
    ${extension}`
}

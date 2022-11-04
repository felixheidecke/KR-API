import database from '#libs/database'
import { productAdapter } from '../_utils.js'

/**
 * get Products from rtd.Shop3Product
 *
 * @param {number|string} id module
 * @returns {Promise<array>}
 */

export const getProducts = async (module, options = {}) => {
  const limit = options.limit || 9999

  const query = baseQuery(
    `WHERE
      p.active = 1
    AND
      p.module = ?
    ORDER BY
      p.priority ASC
    LIMIT
      ?`
  )

  try {
    const [rows] = await database.execute(query, [module, limit])

    if (!rows.length) return []

    return rows.map((row) => productAdapter(row))
  } catch (error) {
    console.error(error)
    return error
  }
}

/**
 * get Product from rtd.Shop3Product
 *
 * @param {number|string} id _id
 * @returns {Promise<object|null>}
 */

export const getProduct = async (id) => {
  const query = baseQuery('WHERE p._id = ?')

  try {
    const [rows] = await database.execute(query, [id])

    if (!rows.length) return null

    return productAdapter(rows[0])
    // return rows[0]
  } catch (error) {
    console.error(error)
    return error
  }
}

/**
 * get Product price from rtd.Shop3Product
 *
 * @param {number|string} id _id
 * @returns {Promise<object|null>}
 */

export const getProductPrice = async (id) => {
  const query = 'SELECT price FROM rtd.Shop3Product WHERE _id = ?'

  try {
    const [rows] = await database.execute(query, [id])

    if (!rows.length) return null

    return rows[0].price
  } catch (error) {
    console.error(error)
    return error
  }
}

/**
 * get Product price from rtd.Shop3Product
 *
 * @param {number|string} id group
 * @returns {Promise<array>}
 */

export const getProductsByCategory = async (id) => {
  const query = baseQuery('WHERE p.group = ?')

  try {
    const [rows] = await database.execute(query, [id])

    if (!rows.length) return []

    return rows.map((row) => productAdapter(row))
  } catch (error) {
    console.error(error)
    return error
  }
}

// --- [ Helper ] --------------------------------------------------------------

const baseQuery = (extension = '') => {
  return `
    SELECT
      p.name, p.productCode, p.ean, p.frontpage,
      p.description, p.teaser, p.legal, p.price,
      p.tax, p.image, p.imageBig, p.pdf,
      p.pdfName, p.pdfTitle, p.weight, c.defaultWeight,
      p.quantity, c.defaultQuantity, p.unit,
      c.defaultUnit, p.group AS categoryId,
      c.name AS categoryName
    FROM
      rtd.Shop3Product AS p
    LEFT
      JOIN rtd.Shop3Group AS c ON p.group = c._id
    ${extension}`
}

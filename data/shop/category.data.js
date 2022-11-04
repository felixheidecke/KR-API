import database from '#libs/database'
import { categoryAdapter } from '../_utils.js'

/**
 * Fetch Categories from rtd.Shop3Group
 *
 * @param {number} id module
 * @returns {Promise<array>}
 */

export const getCategories = async (module) => {
  const query = `
    SELECT
      _id AS id, name, description
    FROM
      rtd.Shop3Group
    WHERE
      active = 1
    AND
      module = ?
    ORDER BY
      priority ASC`

  try {
    const [rows] = await database.execute(query, [module])

    if (!rows.length) return []

    return rows
  } catch (error) {
    console.error(error)
    return error
  }
}

/**
 * Fetch Category from rtd.Shop3Group
 *
 * @param {number} id _id
 * @returns {Promise<object|null>}
 */

export const getCategory = async (id) => {
  const query = `
    SELECT
      _id, name, description
    FROM
      rtd.Shop3Group
    WHERE
      _id = ?
    AND
      active = 1
    LIMIT
      1`

  try {
    const [rows] = await database.execute(query, [id])

    if (!rows.length) return null

    return categoryAdapter(rows[0])
  } catch (error) {
    console.error(error)
    return error
  }
}

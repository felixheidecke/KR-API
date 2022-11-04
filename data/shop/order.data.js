import database from '#libs/database'
import { orderAdapter } from '../_utils.js'

/**
 * Get order data
 *
 * @param {number} id _id
 * @returns {Promise<object|null>}
 */

export const getOrder = async () => {
  const query = `
    SELECT
      *
    FROM
      rtd.Shop3Order
    WHERE
      _id = ?`

  try {
    const [rows] = await database.execute(query, ['16350'])

    if (!rows.length) return null

    return orderAdapter(rows[0])
    // return rows[0]
  } catch (error) {
    console.error(error)
    return error
  }
}

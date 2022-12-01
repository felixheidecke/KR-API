import database from '#libs/database'
import { categoryAdapter } from '#utils/shop-category'

/**
 * Fetch Categories from rtd.Shop3Group
 *
 * @param {number} id module
 * @returns {Promise<array>}
 */

export const getCategories = async (module) => {
  const query = `
    SELECT    g._id as id, g.name,
              g.description, COUNT(p._id) as productCount
    FROM      rtd.Shop3Group AS g
    LEFT JOIN rtd.Shop3Product AS p ON g._id = p.group
    AND       p.active = 1
    WHERE     g.active = 1
    AND       g.module = ?
    GROUP BY  g._id
    ORDER BY  g.priority ASC`

  const [rows] = await database.execute(query, [module])

  if (!rows.length) return []

  return rows.map(categoryAdapter)
}

/**
 * Fetch Category from rtd.Shop3Group
 *
 * @param {number} id _id
 * @returns {Promise<object|null>}
 */

export const getCategory = async (id) => {
  const query = `
    SELECT    g._id as id, g.name,
              g.description, COUNT(p._id) as productCount
    FROM      rtd.Shop3Group AS g
    LEFT JOIN rtd.Shop3Product AS p ON g._id = p.group
    WHERE     g._id = ?
    LIMIT     1`

  const [rows] = await database.execute(query, [id])

  if (!rows.length) return null

  return categoryAdapter(rows[0])
}

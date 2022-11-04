import database from '#libs/database'
import { menuAdapter } from './_utils.js'

/**
 * Fetch menu-card
 *
 * @param {number} id module id
 * @returns {Promise<array>} Menu
 */

export const getMenuByModule = async (id) => {
  const query = `
    SELECT
      menu._id as id, menu.title, menu.description,
      menu.price, category.title as category,
      category.description as category_description,
      category._id as category_id
    FROM rtd.MenuItem AS menu
    LEFT JOIN rtd.MenuSection AS category ON menu.section = category._id
    WHERE menu.active = 1
    AND menu.module = ?
    ORDER BY menu.priority ASC`

  try {
    const [rows] = await database.execute(query, [id])

    if (!rows.length) []

    return menuAdapter(rows)
  } catch (error) {
    console.error(error)
    return error
  }
}

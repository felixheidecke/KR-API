import database from '#libs/database'
import { menuAdapter } from '#utils/menu-cart'

/**
 * Fetch menu-card
 *
 * @param {number} id module id
 * @returns {Promise<array>} Menu
 */

export const getMenuByModule = async (id) => {
  const query = `
    SELECT    m._id as id, m.title, m.description, m.price, c.title as category,
              c.description as category_description, c._id as category_id
    FROM      rtd.MenuItem AS m
    LEFT JOIN rtd.MenuSection AS c ON m.section = c._id
    WHERE     m.active = 1
    AND       m.module = ?
    ORDER BY  m.priority ASC`

  const [rows] = await database.execute(query, [id])

  if (!rows.length) []

  return menuAdapter(rows)
}

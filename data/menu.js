import database from '#libs/database'

import { groupBy, reduce } from 'lodash-es'

/**
 * Fetch article
 *
 * @param {number} id Article id
 * @returns {object|null} Article
 */

export const getMenuByModule = async (id) => {
  const query = `
    SELECT
      menu._id as id, menu.title, menu.description,
      menu.price, category.title as category,
      category._id as category_id
  FROM
    rtd.MenuItem AS menu
  LEFT JOIN
    rtd.MenuSection AS category ON menu.section = category._id
  WHERE
    menu.active = 1
  AND
    menu.module = ?
  ORDER BY
    menu.priority ASC`

  try {
    const [rows] = await database.execute(query, [id])

    if (!rows.length) {
      return null
    }

    return menuAdapter(rows)
  } catch (error) {
    console.error(error)
    return error
  }
}

const menuAdapter = function (rows) {
  const groups = groupBy(rows, 'category')

  const data = reduce(
    groups,
    (menu, items) => {
      return [
        ...menu,
        {
          name: items[0].category,
          items: itemsAdapter(items)
        }
      ]
    },
    []
  )

  return data
}

const itemsAdapter = (items) => {
  return items.map((item) => {
    return {
      id: item.id,
      name: item.title,
      description: item.description,
      price: item.price
    }
  })
}

import database from '#libs/database'
import { groupBy, reduce } from 'lodash-es'
import textile from 'textile-js'
// import { menuAdapter } from '#utils/menu-cart'

/**
 * Fetch menu-card
 *
 * @param {number} id module id
 * @returns {Promise<array>} Menu
 */

export default class MenuCard {
  #menuCard = []

  _constructor(menuCard) {
    if (!menuCard) return

    this.import(menuCard)
  }

  get data() {
    if (!this.#menuCard.length) return null

    const groups = groupBy(this.#menuCard, 'category')
    const data = reduce(
      groups,
      (menu, items) => {
        const name = items[0].category.trim()
        const description = items[0].category_description.trim().length
          ? textile.parse(items[0].category_description)
          : null

        return [
          ...menu,
          {
            name,
            description,
            items: items.map((item) => {
              return {
                id: item.id,
                name: item.title,
                description: item.description.trim().length
                  ? textile.parse(item.description)
                  : null,
                price: item.price
              }
            })
          }
        ]
      },
      []
    )

    return data
  }

  get hasData() {
    return !!this.#menuCard.length
  }

  // --- [ Methods ] -----------------------------------------------------------

  async fetch(id) {
    this.#menuCard = (await fetchMenuCard(id)) || []

    return this
  }

  import(menuCard) {
    this.#menuCard = [...menuCard]

    return this
  }

  export() {
    return [...this.#menuCard]
  }
}

export async function fetchMenuCard(id) {
  const query = `
    SELECT    m._id as id, m.title, m.description, m.price, c.title as category,
              c.description as category_description, c._id as category_id
    FROM      rtd.MenuItem AS m
    LEFT JOIN rtd.MenuSection AS c ON m.section = c._id
    WHERE     m.active = 1
    AND       m.module = ?
    ORDER BY  m.priority ASC`

  const [rows] = await database.execute(query, [id])

  if (!rows.length) return

  return rows
}

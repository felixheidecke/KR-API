import { groupBy, reduce } from 'lodash-es'
import database from '#libs/database'
import expandPrice from '#utils/expand-price'
import textile from 'textile-js'
import { ASSET_BASE_URL } from '#constants'

export default class MenuCard {
  #id

  // Data
  #menuCard = []

  constructor(id) {
    if (!id) throw new Error('Missing required parameter "id"')

    this.#id = id
  }

  get data() {
    if (!this.length) return null

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
            description: description || undefined,
            items: items.map((item) => {
              return {
                name: item.title,
                description: item.description.trim().length
                  ? textile.parse(item.description)
                  : undefined,
                image: item.image
                  ? {
                      src: ASSET_BASE_URL + item.image,
                      alt: item.title
                    }
                  : undefined,
                price: expandPrice(item.price)
              }
            })
          }
        ]
      },
      []
    )

    return data
  }

  get length() {
    return this.#menuCard.length
  }

  async load() {
    this.#menuCard = (await MenuCard.fetchMenuCard(this.#id)) || []

    return this
  }

  static async fetchMenuCard(id) {
    const query = `
      SELECT    m._id as id, m.title, m.description, m.price, m.image, c.title as category,
                c.description as category_description, c._id as category_id
      FROM      rtd.MenuItem AS m
      LEFT JOIN rtd.MenuSection AS c ON m.section = c._id
      WHERE     m.active = 1
      AND       m.module = ${id}
      ORDER BY  c.priority, m.priority`

    const [rows] = await database.execute(query)

    return rows.length ? rows : null
  }

  import({ menuCard }) {
    this.#menuCard = menuCard
  }

  export() {
    return {
      menuCard: this.#menuCard
    }
  }

  from(event) {
    if (event.name !== 'MenuCard') return

    this.import(event.export())
  }
}

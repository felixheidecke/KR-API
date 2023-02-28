import { toUrlSlug } from '#libs/slugify'
import database from '#src/libs/database.js'
import textile from 'textile-js'

export class Shop3Category {
  #category

  constructor(category = {}) {
    this.#category = category
  }

  get export() {
    return Object.freeze(this.#category)
  }

  exists() {
    return '_id' in this.#category
  }

  hasProducts() {
    return this.#category.productCount > 0
  }

  getID() {
    return this.#category._id
  }

  getName() {
    return this.#category.name.trim()
  }

  getSlug() {
    return toUrlSlug(this.#category.name)
  }

  getDescription() {
    if (!this.#category.description) return ''

    return textile.parse(this.#category.description)
  }

  getProductCount() {
    return this.#category.productCount
  }

  getAll() {
    return {
      id: this.getID(),
      name: this.getName(),
      slug: this.getSlug(),
      description: this.getDescription(),
      productCount: this.getProductCount()
    }
  }

  async fetch(id) {
    await this.#fetch(id)

    return this
  }

  async #fetch(id) {
    const query = `
      SELECT    category._id, category.name, category.description,
                COUNT(product._id) as productCount
      FROM      rtd.Shop3Group AS category
      LEFT JOIN rtd.Shop3Product AS product ON category._id = product.group
      WHERE     category._id = ?
      LIMIT     1`

    const [rows] = await database.execute(query, [id])

    if (!rows.length) return null

    this.#category = rows[0]
    return this.#category
  }
}

export class Shop3Categories {
  #categories

  constructor(categories = []) {
    this.#categories = categories
  }

  get export() {
    return Object.freeze(this.#categories)
  }

  exists() {
    return this.#categories.length > 0
  }

  getIDs() {
    return this.#categories.map(({ _id }) => _id)
  }

  getAll() {
    return this.#categories.map((category) => category.getAll())
  }

  async fetch(module) {
    await this.#fetch(module)

    return this
  }

  async #fetch(module) {
    const query = `
    SELECT    category._id, category.name, category.description,
              COUNT(product._id) as productCount
    FROM      rtd.Shop3Group AS category
    LEFT JOIN rtd.Shop3Product AS product ON category._id = product.group
    AND       product.active = 1
    WHERE     category.active = 1
    AND       category.module = ?
    GROUP BY  category._id
    ORDER BY  category.priority ASC`

    const [rows] = await database.execute(query, [module])

    if (!rows.length) return

    this.#categories = rows.map((category) => new Shop3Category(category))
  }
}

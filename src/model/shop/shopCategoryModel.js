import { toUrlSlug } from '#libs/slugify'
import database from '#libs/database'
import textile from 'textile-js'
import SimpleQuery from '#libs/simple-query-builder'

export default class ShopCategory {
  #id
  #module
  #hasData

  // Data
  #name = ''
  #description = ''

  constructor(id, module) {
    if (!id) {
      throw new Error('Missing required parameter "id"')
    }
    if (!module) {
      throw new Error('Missing required parameter "module"')
    }

    this.#id = id
    this.#module = module
    this.#hasData = false
  }

  get id() {
    return this.#id || undefined
  }

  get name() {
    return this.#name.length ? this.#name.trim() : undefined
  }

  get slug() {
    return this.name ? toUrlSlug(this.name) : undefined
  }

  get description() {
    return this.#description ? textile.parse(this.#description) : undefined
  }

  get data() {
    if (!this.#hasData) return

    return {
      id: this.id,
      name: this.name,
      slug: this.slug,
      description: this.description
    }
  }

  async load(config = {}) {
    const category = await ShopCategory.fetchCategory(
      this.#id,
      this.#module,
      config
    )

    if (category) {
      this.#name = category.name || ''
      this.#description = category.description || ''
      this.#hasData = true
    }
  }

  static async fetchCategory(id, module, config = {}) {
    const query = new SimpleQuery()
    const select = ['category.name']

    if (config.parts?.includes('description')) {
      select.push('category.description')
    }

    query
      .select(select)
      .from('rtd.Shop3Group AS category')
      .where(`category._id = ${id}`)
      .and(`category.module = ${module}`)
      .limit(1)

    const [rows] = await database.execute(query.query)

    return rows.length ? rows[0] : null
  }

  import({ name, description }) {
    this.#name = name
    this.#description = description
    this.#hasData = true
  }

  export() {
    return {
      name: this.#name,
      description: this.#description
    }
  }

  from(event) {
    if (event.name !== 'ShopCategory') return

    this.import(event.export())
  }
}

import database from '#libs/database'
import SimpleQuery from '#libs/simple-query-builder'
import ShopCategory from '#model/shop/shopCategoryModel'

export default class ShopCategories {
  #module

  // Data
  #categories = []

  constructor(module = 0) {
    this.#module = module
  }

  get data() {
    return [...this.#categories]
  }

  get length() {
    this.#categories.length
  }

  async load(config) {
    const rawCategories = await ShopCategories.fetchCategories(
      this.#module,
      config
    )

    if (rawCategories) {
      this.#categories = rawCategories.map(
        ({ _id, name, module, description }) => {
          const category = new ShopCategory(_id, module)

          category.import({
            name,
            description
          })

          return category.data
        }
      )
    }
  }

  static async fetchCategories(module, config = {}) {
    const query = new SimpleQuery()
    const querySelect = ['category.name', 'category._id', 'category.module']

    if (!config.parts?.includes('!description')) {
      querySelect.push('category.description')
    }

    if (!config.parts?.includes('!productCount')) {
      querySelect.push('COUNT(product._id) as productCount')
    }

    query
      .select(querySelect)
      .from('rtd.Shop3Group AS category')
      .leftJoin('rtd.Shop3Product AS product', 'category._id = product.group')
      .and('product.active = 1')
      .where('category.active = 1')
      .and(`category.module = ${module}`)
      .group('category._id')
      .order('category.priority')

    const [rows] = await database.execute(query.query)

    return rows.length ? rows : null
  }
}

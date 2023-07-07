import SimpleQuery from '#libs/simple-query-builder'
import database from '#libs/database'
import ShopProduct from '#model/shop/shopProductModel'

export default class ShopProducts {
  #module
  #exists

  // Data
  #products = []

  constructor(module) {
    if (!module) {
      throw new Error('Missing required parameter "module"')
    }

    this.#module = module
    this.#exists = false
  }

  get data() {
    return this.#products.map(({ data }) => data)
  }

  get length() {
    return this.#products.length
  }

  get exists() {
    return this.#exists
  }

  async checkExists() {
    this.#exists = await ShopProducts.moduleExists(this.#module)
  }

  async load(config = {}) {
    await this.checkExists()

    if (!this.exists) return

    this.#products =
      (await ShopProducts.fetchProducts(this.#module, config)) || []

    return this
  }

  static async fetchProducts(module, { category, highlight, limit } = {}) {
    const query = new SimpleQuery()

    query
      .select([
        'product._id',
        'product.module',
        'product.name',
        'product.productCode',
        'product.ean',
        'product.frontpage',
        'product.description',
        'product.teaser',
        'product.legal',
        'product.price',
        'product.tax',
        'product.image',
        'product.imageBig',
        'product.pdf',
        'product.pdfName',
        'product.pdfTitle',
        'product.weight',
        'category.defaultWeight',
        'product.quantity',
        'category.defaultQuantity',
        'product.unit',
        'attribute.value as altWeight',
        'category.defaultUnit',
        'product.group AS categoryId',
        'category.name AS categoryName'
      ])
      .from('rtd.Shop3Product AS product')
      .leftJoin('rtd.Shop3Group AS category', 'product.group = category._id')
      .leftJoin(
        'rtd.ModuleAttribute AS attribute',
        'product.module = attribute.module'
      )
      .and("attribute.name = 'shipping.unit'")
      .where(`product.module = ${module}`)
      .and('product.active = 1')

    if (highlight) {
      query.and(['product.frontpage =', 1])
    }

    if (category) {
      query.and(['product.group =', category])
    }

    query.order('product.priority')

    if (limit) {
      query.limit(limit)
    }

    const [rows] = await database.execute(query.query)

    if (!rows.length) {
      return null
    }

    const products = []

    rows.forEach((product) => {
      const productModel = new ShopProduct()

      productModel.import({ product })

      products.push(productModel)
    })

    return products
  }

  static async moduleExists(module) {
    const query = `
      SELECT
        COUNT(_id) as found
      FROM
        Module
      WHERE
        \`type\` = "articles"
      AND
        _id = ${module}`

    const [rows] = await database.execute(query)

    return !!rows[0].found
  }

  import({ products }) {
    this.#products = products
  }

  export() {
    return {
      products: this.#products
    }
  }

  from(products) {
    if (products.name !== 'ShopProducts') return

    this.import(products.export())
  }
}

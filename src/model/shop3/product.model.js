import {
  ASSET_BASE_URL,
  NUMBER_FORMAT,
  NUMBER_FORMAT_CURRENCY,
  SHOP_UNIT
} from '#constants'
import database from '#libs/database'
import { toUrlSlug } from '#libs/slugify'
import SimpleQuery from '#libs/simple-query-builder'
import textile from 'textile-js'

export class Shop3Product {
  #product

  constructor(product = {}) {
    this.#product = product
  }

  get export() {
    return Object.freeze(this.#product)
  }

  /**
   * Do we have a product?
   * @returns {boolean}
   */

  exists() {
    return !!this.#product._id
  }

  /**
   * Get product id
   * @returns {number}
   */

  get id() {
    return this.#product._id
  }

  /**
   * Get basic info product info
   * @returns {object} basic information
   */

  get base() {
    const { _id, module, name, productCode, ean, frontpage } = this.#product

    return {
      id: _id,
      module,
      name,
      slug: toUrlSlug(name),
      code: productCode,
      EAN: ean,
      frontpage: !!frontpage
    }
  }

  /**
   * Get formatted product description
   * @returns {string} HTML description
   */

  getDescription() {
    const { description } = this.#product

    return description ? textile.parse(description) : null
  }

  /**
   * Get formatted product teaser
   * @returns {string} HTML teaser
   */

  getTeaser() {
    const { teaser } = this.#product

    return teaser ? textile.parse(teaser) : null
  }

  /**
   * Get formatted product legal text
   * @returns {string} HTML legal text
   */

  getLegalInfo() {
    const { legal } = this.#product

    return legal ? textile.parse(legal) : null
  }

  getCategory() {
    const { categoryId, categoryName } = this.#product

    return categoryId
      ? {
          id: categoryId,
          name: categoryName,
          slug: toUrlSlug(categoryName)
        }
      : null
  }

  getQuantity() {
    const {
      quantity: baseQuantity,
      defaultQuantity,
      unit: baseUnit,
      defaultUnit
    } = this.#product

    const quantity = baseQuantity || defaultQuantity
    const unit = baseUnit || defaultUnit

    return {
      value: quantity,
      unit,
      formatted: NUMBER_FORMAT.format(quantity) + ' ' + SHOP_UNIT[unit]
    }
  }

  getWeight() {
    const { weight: baseWeight, defaultWeight, altWeight } = this.#product
    const weight = baseWeight || defaultWeight

    return {
      value: weight,
      unit: altWeight ? 'custom' : SHOP_UNIT.kg,
      formatted:
        NUMBER_FORMAT.format(weight) + ' ' + (altWeight || SHOP_UNIT.kg)
    }
  }

  getPrice() {
    const { price } = this.#product

    return {
      value: price,
      formatted: NUMBER_FORMAT_CURRENCY.format(price)
    }
  }

  getVAT() {
    const { tax } = this.#product

    return {
      value: tax,
      formatted: NUMBER_FORMAT.format(tax) + '%'
    }
  }

  getPricePerUnit() {
    const { unit } = this.getQuantity()
    const { quantity, price } = this.#product
    const pricePerUnit = quantity !== 1 ? price / quantity : price

    return {
      value: +pricePerUnit.toFixed(2),
      formatted:
        NUMBER_FORMAT_CURRENCY.format(pricePerUnit) + ' pro ' + SHOP_UNIT[unit]
    }
  }

  getImage() {
    const { image, imageBig, name } = this.#product

    return image
      ? {
          src: ASSET_BASE_URL + image,
          largeSrc: imageBig ? ASSET_BASE_URL + imageBig : null,
          alt: name
        }
      : null
  }

  getPDF() {
    const { pdf, pdfName, pdfTitle } = this.#product
    return pdf
      ? {
          src: ASSET_BASE_URL + pdf,
          name: pdfName || '',
          title: pdfTitle ? pdfTitle.trim() : 'Produktinformationen'
        }
      : null
  }

  getAll() {
    return {
      ...this.base,
      description: this.getDescription(),
      teaser: this.getTeaser(),
      legalInfo: this.getLegalInfo(),
      image: this.getImage(),
      PDF: this.getPDF(),
      category: this.getCategory(),
      quantity: this.getQuantity(),
      weight: this.getWeight(),
      price: this.getPrice(),
      VAT: this.getVAT(),
      pricePerUnit: this.getPricePerUnit()
    }
  }

  async fetch(id, module) {
    const query = baseQuery()
      .where('product._id = ?')
      .and('product.module = ?')
      .limit(1).query

    const [rows] = await database.execute(query, [id, module])

    if (rows.length) {
      this.#product = rows[0]
    }

    return this
  }
}

export class Shop3Products {
  #products = []

  get export() {
    return Object.freeze(this.#products)
  }

  hasProducts() {
    return this.#products.length > 0
  }

  getIDs() {
    return this.#products.map(({ _id }) => _id)
  }

  getAll() {
    return this.export.map((product) => product.getAll())
  }

  async fetch(module, limit = 1000) {
    const query = baseQuery()
      .where('product.module = ?')
      .and('product.active = 1')
      .order('product.priority')
      .limit('?').query

    const [rows] = await database.execute(query, [module, limit])

    if (rows.length) {
      this.#products = rows.map((product) => new Shop3Product(product))
    }

    return this
  }

  async fetchByCategory(categoryId, limit = 1000) {
    const query = baseQuery()
      .where('product.group = ?')
      .and('product.active = 1')
      .order('product.priority')
      .limit('?').query

    const [rows] = await database.execute(query, [categoryId, limit])

    if (rows.length) {
      this.#products = rows.map((product) => new Shop3Product(product))
    }

    return this
  }
}

// Basic query for product fetching
const baseQuery = () =>
  new SimpleQuery()
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

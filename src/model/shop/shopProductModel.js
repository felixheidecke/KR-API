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
import expandPrice from '#utils/expand-price'

export default class ShopProduct {
  #id
  #module

  // Data
  #product = {}

  constructor(id = 0, module = 0) {
    this.#id = id
    this.#module = module
  }

  get id() {
    return +this.#product._id
  }

  get module() {
    return +this.#product.module
  }

  get name() {
    return this.#product.name?.trim()
  }

  get slug() {
    return this.name ? toUrlSlug(this.name) : undefined
  }

  get code() {
    return this.#product.productCode || undefined
  }

  get EAN() {
    return this.#product.ean || undefined
  }

  get isHighlight() {
    return !!this.#product.frontpage
  }

  get description() {
    const { description } = this.#product

    return description ? textile.parse(description) : undefined
  }

  get teaser() {
    const { teaser } = this.#product

    return teaser ? textile.parse(teaser) : undefined
  }

  get legalInfo() {
    const { legal } = this.#product

    return legal ? textile.parse(legal) : undefined
  }

  get category() {
    const { categoryId, categoryName } = this.#product

    return categoryId
      ? {
          id: categoryId,
          name: categoryName,
          slug: toUrlSlug(categoryName)
        }
      : undefined
  }

  get quantity() {
    const {
      quantity: baseQuantity,
      defaultQuantity,
      unit: baseUnit,
      defaultUnit
    } = this.#product

    const quantity = baseQuantity || defaultQuantity || 0
    const unit = baseUnit || defaultUnit

    return {
      value: quantity,
      unit,
      formatted: NUMBER_FORMAT.format(quantity) + ' ' + SHOP_UNIT[unit]
    }
  }

  get weight() {
    const { weight: baseWeight, defaultWeight, altWeight } = this.#product
    const weight = baseWeight || defaultWeight || 0

    return {
      value: weight,
      unit: altWeight ? 'custom' : SHOP_UNIT.kg,
      formatted:
        NUMBER_FORMAT.format(weight) + ' ' + (altWeight || SHOP_UNIT.kg)
    }
  }

  get price() {
    return expandPrice(this.#product.price)
  }

  get VAT() {
    const { tax } = this.#product

    return {
      value: tax,
      formatted: NUMBER_FORMAT.format(tax) + '%'
    }
  }

  get pricePerUnit() {
    const { unit, value: quantity } = this.quantity
    const { price } = this.#product
    const pricePerUnit = (quantity !== 1 ? price / quantity : price) || 0

    return {
      value: +pricePerUnit.toFixed(2),
      formatted:
        NUMBER_FORMAT_CURRENCY.format(pricePerUnit) + ' pro ' + SHOP_UNIT[unit]
    }
  }

  get image() {
    const { image, imageBig, name } = this.#product

    return image
      ? {
          src: ASSET_BASE_URL + image,
          largeSrc: imageBig ? ASSET_BASE_URL + imageBig : null,
          alt: name
        }
      : undefined
  }

  get PDF() {
    const { pdf, pdfName, pdfTitle } = this.#product
    return pdf
      ? {
          src: ASSET_BASE_URL + pdf,
          name: pdfName || '',
          title: pdfTitle ? pdfTitle.trim() : 'Produktinformationen'
        }
      : undefined
  }

  get data() {
    return {
      id: this.id,
      module: this.module,
      name: this.name,
      slug: this.slug,
      code: this.code,
      EAN: this.EAN,
      isHighlight: this.isHighlight,
      description: this.description,
      teaser: this.teaser,
      legalInfo: this.legalInfo,
      image: this.image,
      PDF: this.PDF,
      category: this.category,
      quantity: this.quantity,
      weight: this.weight,
      price: this.price,
      VAT: this.VAT,
      pricePerUnit: this.pricePerUnit
    }
  }

  get length() {
    return this.#product._id ? 1 : 0
  }

  async load() {
    this.#product =
      (await ShopProduct.fetchProduct(this.#id, this.#module)) || {}
  }

  static async fetchProduct(id, module) {
    const query = new SimpleQuery()
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
      .where(['product._id =', id])
      .and(['product.module =', module])
      .limit(1)

    const [rows] = await database.execute(query.query)

    return rows.length ? rows[0] : null
  }

  import({ product }) {
    if (!product) return

    this.#product = product
  }

  export() {
    return {
      product: this.#product
    }
  }

  from(product) {
    if (product.name !== 'ShopProduct') return

    this.import(product.export())
  }
}

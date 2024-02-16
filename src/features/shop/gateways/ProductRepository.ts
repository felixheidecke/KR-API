import { CategoryRepository } from './CategoryRepository.js'
import { DetailLevel } from '../utils/detail-level.js'
import { Image } from '../../../common/entities/Image.js'
import { ModuleRepository } from './ModuleRepository.js'
import { PDF } from '../entities/PDF.js'
import { Product } from '../entities/Product.js'
import knex from '../../../services/knex.js'

import type { Knex } from 'knex'
import { isNumber } from 'lodash-es'

type RepositoryProduct = {
  _id: number
  name: string
  teaser?: string
  description?: string
  legal?: string
  productCode?: string
  ean?: string
  image?: string | null
  imageBig?: string | null
  pdf?: string | null
  pdfName?: string | null
  pdfTitle?: string
  active?: 0 | 1
  unit?: string
  defaultUnit?: string | null
  price?: number
  tax?: number
  priority?: number
  frontpage?: 1 | 0
  frontpagePriority?: number
  group?: string | null
  module?: number
  weight?: number
  defaultWeight?: number | null
  quantity?: number
  defaultQuantity?: number | null
  shippingUnit?: string | null
}

export class ProductRepository {
  public static async getProduct(module: number, id: number) {
    const repositoryProduct = await this.queryProductBase()
      .where({ 'product._id': id, 'product.module': module })
      .first()

    if (!repositoryProduct) return null

    const product = toNewProduct(module, repositoryProduct)

    if (repositoryProduct.group) {
      product.path = await CategoryRepository.getPath(repositoryProduct.group)
    }

    return product
  }

  public static async getProducts(
    module: number,
    query?: {
      categoryId?: number
      highlights?: boolean
      limit?: number
    },
    complexity: DetailLevel = 0,
    skipModuleCheck = false
  ) {
    if (!skipModuleCheck && !(await ModuleRepository.moduleExists(module))) return null

    let productsQuery: Knex.QueryBuilder

    // Minimal product data
    if (complexity === DetailLevel.MINIMAL) {
      productsQuery = knex
        .select('_id', 'name', 'frontpage', 'group')
        .from('Shop3Product as product')
    }
    // Basic product data
    else if (complexity === DetailLevel.BASIC) {
      productsQuery = knex
        .select(
          '_id',
          'name',
          'frontpage',
          'group',
          'productCode',
          'ean',
          'image',
          'imageBig',
          'description',
          'teaser',
          'legal',
          'price',
          'tax'
        )
        .from('Shop3Product as product')
    }
    // Full product data
    else {
      productsQuery = this.queryProductBase()
    }

    productsQuery.where({ 'product.module': module, 'product.active': 1 })

    // Filter by highlight
    if (query?.highlights) {
      productsQuery.andWhere('product.frontpage', 1)
    } else if (query?.highlights === false) {
      productsQuery.andWhere('product.frontpage', 0)
    }

    // Filter by category
    if (query?.categoryId) {
      productsQuery.andWhere('product.group', query.categoryId)
    }

    productsQuery.orderBy('product.priority').limit(query?.limit || 250)

    const repositoryProducts = (await productsQuery) as RepositoryProduct[]

    return await Promise.all(
      repositoryProducts.map(async repositoryProduct => {
        const product = toNewProduct(module, repositoryProduct)

        if (repositoryProduct.group && complexity >= DetailLevel.FULL) {
          product.path = await CategoryRepository.getPath(+repositoryProduct.group)
        }

        return product
      })
    )
  }

  private static queryProductBase(): Knex.QueryBuilder {
    return knex
      .select(
        'product.*',
        'category.defaultWeight',
        'category.defaultQuantity',
        'category.defaultUnit',
        'attribute.value as shippingUnit'
      )
      .from('Shop3Product as product')
      .leftJoin('Shop3Group as category', 'product.group', 'category._id')
      .leftJoin('ModuleAttribute as attribute', function () {
        this.on('product.module', '=', 'attribute.module').andOn(
          'attribute.name',
          '=',
          knex.raw('"shipping.unit"')
        )
      })
  }
}

function toNewProduct(module: number, raw: RepositoryProduct): Product {
  const product = new Product(module)
  product.id = raw._id
  product.group = raw.group ? +raw.group : undefined
  product.name = raw.name.trim()
  product.code = raw.productCode
  product.ean = raw.ean
  product.description = raw.description?.trim()
  product.teaser = raw.teaser?.trim()
  product.legal = raw.legal?.trim()
  product.vat = raw.tax
  product.price = raw.price ?? undefined
  product.isHighlight = !!raw.frontpage

  if (raw.weight || raw.defaultWeight) {
    product.weight = {
      value: raw.weight || raw.defaultWeight || 0,
      unit: raw.shippingUnit || raw.defaultUnit || 'kg'
    }
  }

  if (raw.quantity || raw.defaultQuantity) {
    product.quantity = {
      value: raw.quantity || raw.defaultQuantity || 1,
      unit: raw.unit || raw.defaultUnit || 'ea'
    }
  }

  if (raw.imageBig) {
    product.image = new Image(raw.imageBig, raw.name)

    if (raw.image) {
      product.image.addSrc(raw.image, 'small')
    }
  }

  if (raw.pdf) {
    product.pdf = new PDF(raw.pdf)
    product.pdf.title = raw.pdfTitle as string
  }

  return product
}

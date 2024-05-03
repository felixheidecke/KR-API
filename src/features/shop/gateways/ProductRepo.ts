import { DATA_BASE_PATH } from '../../../common/utils/constants.js'
import { GroupRepo } from './GroupRepo.js'
import { isBoolean, isUndefined, omitBy } from 'lodash-es'
import knex from '../../../modules/knex.js'

import type { Knex } from 'knex'

export namespace ProductRepo {
  export type Product = {
    _id: number
    module: number
    name: string
    teaser: string
    description?: string
    legal?: string
    productCode: string
    ean: string
    image: string | null
    imageBig: string | null
    path?: GroupRepo.GroupPath[]
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
    group: string | null
    weight?: number
    defaultWeight?: number | null
    quantity?: number
    defaultQuantity?: number | null
    shippingUnit?: string | null
  }
}

export class ProductRepo {
  public static async productExists(module: number, id: number) {
    const query = knex
      .select('_id')
      .from('Shop3Product')
      .where({ module, _id: id, active: 1 })
      .first()

    return !!(await query)
  }

  public static async readProduct(module: number, id: number) {
    return new RepoProductBuilder(module).where({ 'product._id': id }).readOne()
  }

  public static async readProducts(
    module: number,
    config?: { limit?: number; frontpage?: boolean }
  ) {
    const query = new RepoProductBuilder(module)

    if (isBoolean(config?.frontpage)) {
      query.where({ 'product.frontpage': config.frontpage ? 1 : 0 })
    }

    return query.readMany(config?.limit)
  }

  public static async readProductsByGroup(
    module: number,
    group: number,
    config?: {
      limit?: number
      recursive?: boolean
    }
  ) {
    let groupIds: number[] = config?.recursive
      ? await GroupRepo.readGroupIdsRecursive(module, group)
      : [group]

    return new RepoProductBuilder(module).whereIn('product.group', groupIds).readMany(config?.limit)
  }
}

class RepoProductBuilder {
  private _query: Knex.QueryBuilder

  constructor(private module: number) {
    this._query = knex
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
      .where({ 'product.module': this.module, 'product.active': 1 })
  }

  get query() {
    return this._query
  }

  public where(where: Record<string, any>) {
    this._query.andWhere(omitBy(where, isUndefined))

    return this
  }

  public whereIn(key: string, values: any[]) {
    this._query.whereIn(key, values)

    return this
  }

  public async readOne() {
    try {
      const repoProduct = (await this._query
        .orderBy('product.priority')
        .first()) as unknown as ProductRepo.Product

      if (!repoProduct) return null

      if (repoProduct.group) {
        repoProduct.path = await GroupRepo.readGroupPath(+repoProduct.group)
      }

      return this._mapRawProduct(repoProduct)
    } catch (error) {
      console.error(error)
      throw new Error('SQL Error')
    }
  }

  public async readMany(limit?: number) {
    const repoProducts = (await this._query
      .limit(limit ?? 1000)
      .orderBy('product.priority')) as unknown as ProductRepo.Product[]

    return await Promise.all(
      repoProducts.map(async (repoProduct: ProductRepo.Product) => {
        if (repoProduct.group) {
          repoProduct.path = await GroupRepo.readGroupPath(+repoProduct.group)
        }

        return this._mapRawProduct(repoProduct)
      })
    )
  }

  private _mapRawProduct(repoProduct: ProductRepo.Product): ProductRepo.Product {
    return {
      ...repoProduct,
      image: repoProduct.image ? DATA_BASE_PATH + '/' + repoProduct.image : null,
      imageBig: repoProduct.imageBig ? DATA_BASE_PATH + '/' + repoProduct.imageBig : null,
      pdf: repoProduct.pdf ? DATA_BASE_PATH + '/' + repoProduct.pdf : null
    }
  }
}

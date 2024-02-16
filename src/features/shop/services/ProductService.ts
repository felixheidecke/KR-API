import { GroupPath } from '../entities/GroupPath.js'
import { HttpError } from '../../../common/decorators/Error.js'
import { Image } from '../../../common/entities/Image.js'
import { ModuleRepo } from '../../../common/gateways/ModuleRepo.js'
import { PDF } from '../entities/PDF.js'
import { Product } from '../entities/Product.js'

import * as GroupRepo from '../gateways/GroupRepo.js'
import { ProductRepo } from '../gateways/ProductRepo.js'

export class ProductService {
  public static async getProduct(
    module: number,
    id: number,
    config: {
      shouldThrow?: boolean
    } = {}
  ): Promise<Product | null> {
    const [moduleExists, repoProduct] = await Promise.all([
      ModuleRepo.moduleExists(module),
      ProductRepo.readProduct(module, id)
    ])

    if (config.shouldThrow && !moduleExists) {
      throw HttpError.NOT_FOUND('Module not found')
    }

    if (config.shouldThrow && !repoProduct) {
      throw HttpError.NOT_FOUND('Product not found')
    }

    return repoProduct ? ProductServiceUtils.createProductFromRepository(repoProduct) : null
  }

  public static async getProducts(
    module: number,
    query?: {
      limit?: number
      frontpage?: boolean
    },
    config: {
      shouldThrow?: boolean
    } = {}
  ): Promise<Product[]> {
    const [moduleExists, repoProducts] = await Promise.all([
      ModuleRepo.moduleExists(module),
      ProductRepo.readProducts(module, query)
    ])

    if (!moduleExists && config.shouldThrow) {
      throw HttpError.NOT_FOUND('Module not found')
    }

    return repoProducts.map(ProductServiceUtils.createProductFromRepository)
  }

  public static async getProductsByCategory(
    module: number,
    group: number,
    query?: {
      limit?: number
      frontpage?: boolean
    },
    config: {
      shouldThrow?: boolean
    } = {}
  ): Promise<Product[]> {
    const [moduleExists, categoryExists, repoCategoryProducts] = await Promise.all([
      ModuleRepo.moduleExists(module),
      GroupRepo.groupExists(module, group),
      ProductRepo.readProductsByGroup(module, group, query)
    ])

    if (config.shouldThrow && !moduleExists) {
      throw HttpError.NOT_FOUND('Module not found')
    }

    if (config.shouldThrow && !categoryExists) {
      throw HttpError.NOT_FOUND('Group not found')
    }

    return repoCategoryProducts.map(ProductServiceUtils.createProductFromRepository)
  }
}

export class ProductServiceUtils {
  public static createProductFromRepository(repoProduct: ProductRepo.Product): Product {
    const product = new Product(repoProduct.module)

    product.id = repoProduct._id
    product.group = repoProduct.group ? +repoProduct.group : undefined
    product.name = repoProduct.name.trim()
    product.code = repoProduct.productCode
    product.ean = repoProduct.ean
    product.description = repoProduct.description?.trim()
    product.teaser = repoProduct.teaser?.trim()
    product.legal = repoProduct.legal?.trim()
    product.vat = repoProduct.tax
    product.price = repoProduct.price ?? undefined
    product.frontpage = !!repoProduct.frontpage

    if (repoProduct.weight || repoProduct.defaultWeight) {
      product.weight = {
        value: repoProduct.weight || repoProduct.defaultWeight || 0,
        unit: repoProduct.shippingUnit || repoProduct.defaultUnit || 'kg'
      }
    }

    if (repoProduct.quantity || repoProduct.defaultQuantity) {
      product.quantity = {
        value: repoProduct.quantity || repoProduct.defaultQuantity || 1,
        unit: repoProduct.unit || repoProduct.defaultUnit || 'ea'
      }
    }

    if (repoProduct.imageBig) {
      product.image = new Image(repoProduct.imageBig, repoProduct.name)

      if (repoProduct.image) {
        product.image.addSrc(repoProduct.image, 'small')
      }
    }

    if (repoProduct.pdf) {
      product.pdf = new PDF(repoProduct.pdf)
      product.pdf.title = repoProduct.pdfTitle as string
    }

    if (repoProduct.path) {
      product.path = new GroupPath()
      product.path.path = repoProduct.path.map(({ _id, name }) => ({ id: _id, name }))
    }

    return product
  }
}

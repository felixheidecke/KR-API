import { GroupPath } from '../entities/group-path.js'
import { HttpError } from '#utils/http-error.js'
import { Product } from '../entities/product.js'
import { ModuleRepo } from '#common/providers/module-repo.js'
import { ProductRepo } from '../providers/product-repo.js'
import { GroupRepo } from '../providers/group-repo.js'
import { Image } from '#common/entities/image.js'
import { PDF } from '#common/entities/pdf.js'

type BaseConfig = {
  skipModuleCheck?: boolean
}

export namespace ProductService {
  export type GetProductById = (module: number, id: number, config?: BaseConfig) => Promise<Product>

  export type GetProductsByModule = (
    module: number,
    query?: { limit?: number; frontpage?: boolean },
    config?: BaseConfig
  ) => Promise<Product[]>

  export type GetProductsByCategory = (
    module: number,
    group: number,
    query?: { limit?: number; frontpage?: boolean },
    config?: BaseConfig
  ) => Promise<Product[]>
}

export class ProductService implements ProductService {
  public static getProductById: ProductService.GetProductById = async (
    module,
    id,
    { skipModuleCheck } = {}
  ) => {
    const [moduleExists, repoProduct] = await Promise.all([
      skipModuleCheck ? ModuleRepo.moduleExists(module, 'shop3') : Promise.resolve(true),
      ProductRepo.readProduct(module, id)
    ])

    if (!moduleExists) {
      throw HttpError.NOT_FOUND('Module not found')
    }

    if (!repoProduct) {
      throw HttpError.NOT_FOUND('Product not found')
    }

    return this.createProductFromRepository(repoProduct)
  }

  public static getProductsByModule: ProductService.GetProductsByModule = async (
    module,
    query = {},
    { skipModuleCheck } = {}
  ) => {
    const [moduleExists, repoProducts] = await Promise.all([
      skipModuleCheck ? ModuleRepo.moduleExists(module, 'shop3') : Promise.resolve(true),
      ProductRepo.readProducts(module, query)
    ])

    if (!moduleExists) {
      throw HttpError.NOT_FOUND('Module not found')
    }

    return repoProducts.map(this.createProductFromRepository)
  }

  public static getProductsByCategory: ProductService.GetProductsByCategory = async (
    module,
    group,
    query = {},
    { skipModuleCheck } = {}
  ) => {
    const [moduleExists, categoryExists, repoCategoryProducts] = await Promise.all([
      skipModuleCheck ? ModuleRepo.moduleExists(module, 'shop3') : Promise.resolve(true),
      GroupRepo.groupExists(module, group),
      ProductRepo.readProductsByGroup(module, group, query)
    ])

    if (!moduleExists) {
      throw HttpError.NOT_FOUND('Module not found')
    }

    if (!categoryExists) {
      throw HttpError.NOT_FOUND('Group not found')
    }

    return repoCategoryProducts.map(this.createProductFromRepository)
  }

  private static createProductFromRepository(repoProduct: ProductRepo.Product): Product {
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

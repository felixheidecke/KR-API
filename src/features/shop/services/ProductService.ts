import { ErrorCodes, ModuleError } from '../../../common/decorators/Error.js'
import { ProductRepository } from '../gateways/ProductRepository.js'
import { DetailLevel } from '../utils/detail-level.js'

export class ProductService {
  public static async getProduct(module: number, id: number) {
    const product = await ProductRepository.getProduct(module, id)

    if (!product) {
      throw new ModuleError('Product not found.', ErrorCodes.NOT_FOUND)
    }

    return product
  }

  public static async getProducts(
    module: number,
    query?: { categoryId?: number; highlights?: boolean; limit?: number },
    detailLevel: DetailLevel = 0
  ) {
    const products = await ProductRepository.getProducts(module, query, detailLevel)

    if (!products) {
      throw new ModuleError('No products found.', ErrorCodes.NOT_FOUND)
    }

    return products
  }
}

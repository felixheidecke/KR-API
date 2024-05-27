import { Cart } from '../entities/Cart.js'
import { HttpError } from '../../../common/decorators/Error.js'
import { ModuleRepo } from '../../../common/gateways/ModuleRepo.js'
import { ProductService } from './ProductService.js'
import { ShippingCostService } from './ShippingCostService.js'
import { SupplementalCostService } from './SupplementalCostService.js'

import type { Product } from '../entities/Product.js'

type BaseConfig = {
  skipModuleCheck?: boolean
  shouldThrow?: boolean
}

export class CartService {
  constructor(public cart: Cart = new Cart(0)) {}

  /**
   * Adds a product to the cart by its ID, incrementing the quantity if it already exists.
   *
   * @param {Cart} cart - The cart to which the product will be added.
   * @param {number} productId - The ID of the product to add.
   */

  public async addProductById(productId: number) {
    this.hasCartCheck()

    let quantity = (this.cart.getProduct(productId)?.quantity || 0) + 1 || 1

    await this.updateProductQuantityById([{ productId, quantity }])
  }

  /**
   * Updates the quantity of one or more products in the cart.
   *
   * @param {Cart} cart - The cart to update.
   * @param {{ productId: number; quantity: number }[]} products - An array of product and quantity pairs.
   * @throws {HttpError} If one or more products are not found.
   */

  public async updateProductQuantityById(products: { productId: number; quantity: number }[]) {
    this.hasCartCheck()

    // Remove products with quantity <= 0
    products
      .filter(({ quantity }) => quantity <= 0)
      .forEach(({ productId }) => {
        this.cart.removeProduct(productId)
      })

    // Update products with quantity > 0
    const productsToUpdate = await Promise.all(
      products
        .filter(({ quantity }) => quantity > 0)
        .map(async ({ productId, quantity }) => {
          const product = await ProductService.getProduct(this.cart.module, productId, {
            shouldThrow: true,
            skipModuleCheck: true
          })

          return {
            product: product as Product,
            quantity
          }
        })
    )

    productsToUpdate.forEach(({ product, quantity }) => {
      this.cart.addProduct(product, quantity)
    })

    this.cart.calculate()
  }

  /**
   * Initialises the cart with supplemental and shipping costs.
   *
   * @param {Cart} cart - The cart to initialise.
   */

  public async initialise(config: BaseConfig = {}) {
    const [moduleExists, supplementalCost, shippingCost] = await Promise.all([
      config.skipModuleCheck
        ? ModuleRepo.moduleExists(this.cart.module, 'shop3')
        : Promise.resolve(true),
      SupplementalCostService.getSupplementalCost(this.cart.module, { skipModuleCheck: true }),
      ShippingCostService.getShippingCost(this.cart.module, { skipModuleCheck: true })
    ])

    if (!moduleExists && config.shouldThrow) {
      throw HttpError.NOT_FOUND('Module not found.')
    }

    if (supplementalCost) {
      this.cart.supplementalCost = supplementalCost
    }

    if (shippingCost) {
      this.cart.shippingCost = shippingCost
    }

    this.cart.calculate()
  }

  private hasCartCheck() {
    if (!this.cart.module) {
      throw new Error('Instance does not have a cart.')
    }
  }
}

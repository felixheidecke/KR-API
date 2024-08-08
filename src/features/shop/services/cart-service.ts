import { Cart } from '../entities/cart.js'
import { HttpError } from '#utils/http-error.js'
import { ProductService } from './product-service.js'
import { ModuleRepo } from '#common/providers/module-repo.js'
import { SupplementalCostService } from './supplemental-cost-service.js'
import { ShippingCostService } from './shipping-cost-service.js'

// --- [ Types ] -----------------------------------------------------------------------------------

type AddProductById = (cart: Cart, productId: number) => Promise<void>

type UpdateProductQuantity = (
  cart: Cart,
  products: { productId: number; quantity: number }[]
) => Promise<void>

type Initialise = (
  cart: Cart,
  config?: {
    skipModuleCheck?: boolean
  }
) => Promise<void>

// --- [ Class ] -----------------------------------------------------------------------------------

export class CartService {
  /**
   * Adds a product to the cart by its ID, incrementing the quantity if it already exists.
   *
   * @param {Cart} cart - The cart to which the product will be added.
   * @param {number} productId - The ID of the product to add.
   */

  public static addProductById: AddProductById = async (cart, productId) => {
    this.hasCartCheck(cart)

    let quantity = (cart.getProduct(productId)?.quantity || 0) + 1 || 1

    await CartService.updateProductQuantity(cart, [{ productId, quantity }])
  }

  /**
   * Updates the quantity of one or more products in the cart.
   *
   * @param {Cart} cart - The cart to update.
   * @param {{ productId: number; quantity: number }[]} products - An array of product and quantity pairs.
   * @throws {HttpError} If one or more products are not found.
   */

  public static updateProductQuantity: UpdateProductQuantity = async (cart, products) => {
    this.hasCartCheck(cart)

    // Remove products with quantity <= 0
    products
      .filter(({ quantity }) => quantity <= 0)
      .forEach(({ productId }) => {
        cart.removeProduct(productId)
      })

    // Update products with quantity > 0
    const productsToUpdate = await Promise.all(
      products
        .filter(({ quantity }) => quantity > 0)
        .map(async ({ productId, quantity }) => {
          try {
            const product = await ProductService.getProductById(cart.module, productId, {
              skipModuleCheck: true
            })

            return {
              product,
              quantity
            }
          } catch {
            throw HttpError.BAD_REQUEST('Unknown product ID.')
          }
        })
    )

    productsToUpdate.forEach(({ product, quantity }) => {
      cart.addProduct(product, quantity)
    })

    cart.calculate()
  }

  /**
   * Initialises the cart with supplemental and shipping costs.
   *
   * @param {Cart} cart - The cart to initialise.
   */

  public static initialise: Initialise = async (cart, config = {}) => {
    if (!config.skipModuleCheck && !ModuleRepo.moduleExists(cart.module, 'shop3')) {
      throw HttpError.NOT_FOUND('Module not found.')
    }

    await Promise.all([
      SupplementalCostService.getSupplementalCost(cart.module, {
        skipModuleCheck: true
      })
        .then(supplementalCost => (cart.supplementalCost = supplementalCost))
        .catch(), // Don't throw an error

      ShippingCostService.getShippingCost(cart.module, {
        skipModuleCheck: true
      })
        .then(shippingCost => (cart.shippingCost = shippingCost))
        .catch() // Don't throw an error
    ])

    cart.calculate()
  }

  private static hasCartCheck(cart: Cart) {
    if (!cart.module) {
      throw new Error('Instance does not have a cart.')
    }
  }
}

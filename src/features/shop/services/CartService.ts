import { HttpError } from '../../../common/decorators/Error.js'
import { Cart } from '../entities/Cart.js'
import { ProductService } from './ProductService.js'
import { ShippingCostService } from './ShippingCostService.js'
import { SupplementalCostService } from './SupplementalCostService.js'

export class CartService {
  /**
   * Adds a product to the cart by its ID, incrementing the quantity if it already exists.
   *
   * @param {Cart} cart - The cart to which the product will be added.
   * @param {number} productId - The ID of the product to add.
   */

  public static async addProductById(cart: Cart, productId: number) {
    let quantity = (cart.getProduct(productId)?.quantity || 0) + 1 || 1

    await CartService.updateProductQuantityById(cart, [{ productId, quantity }])
  }

  /**
   * Updates the quantity of one or more products in the cart.
   *
   * @param {Cart} cart - The cart to update.
   * @param {{ productId: number; quantity: number }[]} products - An array of product and quantity pairs.
   * @throws {HttpError} If one or more products are not found.
   */

  public static async updateProductQuantityById(
    cart: Cart,
    products: { productId: number; quantity: number }[]
  ) {
    await CartService.initialise(cart)

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
          const product = await ProductService.getProduct(cart.module, productId)

          if (!product) {
            throw HttpError.NOT_FOUND('One or more products not found.')
          }

          return { product, quantity }
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

  private static async initialise(cart: Cart) {
    const [supplementalCost, shippingCost] = await Promise.all([
      SupplementalCostService.getSupplementalCost(cart.module),
      ShippingCostService.getShippingCost(cart.module)
    ])

    if (supplementalCost) {
      cart.supplementalCost = supplementalCost
    }

    if (shippingCost) {
      cart.shippingCost = shippingCost
    }
  }

  /**
   * Creates and initialises a new cart for a given module.
   *
   * @param {number} module - The module number for which to create the cart.
   * @returns {Promise<Cart>} A promise that resolves to the newly created and initialised cart.
   */

  public static async load(module: number) {
    const cart = new Cart(module)

    await CartService.initialise(cart)
    cart.calculate()

    return cart
  }
}

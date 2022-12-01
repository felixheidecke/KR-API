import { getReducedProduct } from '#data/shop-product'
import { CART_DEFAULT_DATA, setCartCookie } from '#utils/shop-cart'

/**
 * Return current cart contents
 *
 * @param {import("fastify").FastifyRequest} request
 * @param {import("fastify").FastifyReply} response
 */

export const getCartController = async (request, response) => {
  setCartCookie(response, request.cart)
  response.send(request.cart)
}

/**
 * Add a product to cart
 *
 * @param {import("fastify").FastifyRequest} request
 * @param {import("fastify").FastifyReply} response
 */

export const addToCartController = async (request, response) => {
  const id = request.body.id
  const { price, module } = await getReducedProduct(id)

  if (request.body.module !== module) {
    response.code(422).send({
      message: 'id/module missmatch'
    })
    return
  }

  // Product data
  const cartProducts = new Map(Object.entries(request.cart.products))
  const product = cartProducts.get(id)
  const quantity = product ? product[0] + 1 : 1 // increment by one, or set one

  cartProducts.set(id, [quantity, price, price * quantity])

  let cartTotal = 0
  cartProducts.forEach((product) => {
    // No reduce for Maps.
    cartTotal = cartTotal + product[2]
  })

  request.cart = {
    shop: module,
    total: cartTotal,
    products: Object.fromEntries(cartProducts)
  }

  setCartCookie(response, request.cart)
  response.send(request.cart)
}

/**
 * Update the amount of a product in the cart
 *
 * @param {import("fastify").FastifyRequest} request
 * @param {import("fastify").FastifyReply} response
 */

export const updateCartController = async (request, response) => {
  const id = request.body.id
  const { price, module } = await getReducedProduct(id)
  let quantity = request.body.quantity

  if (request.body.module !== module) {
    response.code(422).send({
      message: 'id/module missmatch'
    })
    return
  }

  // Product data
  const cartProducts = new Map(Object.entries(request.cart.products))

  if (quantity <= 0) {
    cartProducts.delete(id)
  } else {
    cartProducts.set(id, [quantity, price, price * quantity])
  }

  let cartTotal = 0
  cartProducts.forEach((product) => {
    cartTotal = cartTotal + product[2]
  })

  request.cart = {
    shop: module,
    total: cartTotal,
    products: Object.fromEntries(cartProducts)
  }

  setCartCookie(response, request.cart)
  response.send(request.cart)
}

export const resetCartController = async (_, response) => {
  setCartCookie(response, CART_DEFAULT_DATA)
  response.code(204).send()
}

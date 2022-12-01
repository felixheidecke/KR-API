import { ShopCart } from '#model/shop-cart'

/**
 * Return current cart contents
 *
 * @param {import("fastify").FastifyRequest} request
 * @param {import("fastify").FastifyReply} response
 */

export const getCartController = async (request, response) => {
  const cart = new ShopCart()
  const { body } = request
  cart.token = body.token

  if (!body.token) {
    await cart.initialise(body.module)
  }

  response.send({
    cart: cart.entries,
    token: cart.token
  })
}

/**
 * Add a product to cart
 *
 * @param {import("fastify").FastifyRequest} request
 * @param {import("fastify").FastifyReply} response
 */

export const addToCartController = async (request, response) => {
  const cart = new ShopCart()
  const { body } = request
  cart.token = body.token

  if (!body.token) {
    await cart.initialise(body.module)
  }

  await cart.addItem(body.id)

  response.send({
    cart: cart.entries,
    token: cart.token
  })
}

/**
 * Update the amount of a product in the cart
 *
 * @param {import("fastify").FastifyRequest} request
 * @param {import("fastify").FastifyReply} response
 */

export const updateCartController = async (request, response) => {
  const cart = new ShopCart()
  cart.token = request.body.token

  if (quantity <= 0) {
    await cart.removeItem(id)
  } else {
    await cart.updateItem(id, quantity)
  }

  response.send({
    cart: cart.entries,
    token: cart.token
  })
}

export const resetCartController = async (_, response) => {
  const cart = new ShopCart()

  response.send({
    cart: cart.entries,
    token: cart.token
  })
}

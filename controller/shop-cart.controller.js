import { sign } from '#libs/jwt'
import { add } from 'date-fns'

/**
 *
 * @param {import("fastify").FastifyRequest} request
 * @param {import("fastify").FastifyReply} response
 */

export const getCartController = async ({ cart }, response) =>
  response.send(cart)

/**
 *
 * @param {import("fastify").FastifyRequest} request
 * @param {import("fastify").FastifyReply} response
 */

export const addToCartController = async (request, response) => {
  const { id, quantity } = request.body
  const { price, module } = await getReducedProduct(id)
  let cartTotal = 0

  if (request.body.module !== module) {
    response.clearCookie(cartCookieName)
    response.code(422).send({
      error: 'id/module missmatch',
      message: 'cart has been reset!'
    })
    return
  }

  // Product data
  const cartProducts = new Map(Object.entries(request.cart.products))
  const productSubtotal = price * quantity

  cartProducts.set(id, {
    price,
    subtotal: productSubtotal,
    quantity
  })

  cartProducts.forEach(({ subtotal }) => {
    cartTotal = cartTotal + subtotal
  })

  request.cart = {
    shop: module,
    total: cartTotal,
    products: Object.fromEntries(cartProducts)
  }

  response.cookie(cartCookieName, sign(request.cart), cartCookieOptions())
  response.send(request.cart)
}

/**
 *
 * @param {import("fastify").FastifyRequest} request
 * @param {import("fastify").FastifyReply} response
 */

export const removeFromCartController = async (request, response) => {
  const id = `${request.body.id}` // As string
  const cartProducts = new Map(Object.entries(request.cart.products))
  let cartTotal = 0

  if (!cartProducts.has(id)) {
    response.send(request.cart)
    return
  }

  // Remove product from cart
  cartProducts.delete(id)

  // Calculate total
  cartProducts.forEach(({ subtotal }) => {
    cartTotal = cartTotal + subtotal.value
  })

  request.cart = {
    total: {
      value: cartTotal,
      formatted: NUMBER_FORMAT_CURRENCY.format(cartTotal)
    },
    products: Object.fromEntries(cartProducts)
  }

  response.cookie(cartCookieName, sign(request.cart), cartCookieOptions())
  response.send(request.cart)
}

export const resetCartController = async (_, response) => {
  response.clearCookie(cartCookieName)
  response.code(204).send()
}

// Helper

const cartCookieName = 'Shop3Cart'

const cartCookieOptions = () => {
  return {
    expires: add(new Date(), { minutes: 30 }),
    secure: true,
    path: '/shop'
  }
}

export const helper = {
  cartCookieName,
  cartCookieOptions
}

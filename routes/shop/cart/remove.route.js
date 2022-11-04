import { cacheNoStore as cacheNoStoreHeader } from '#hooks/header'
import { sign } from '#libs/jwt'
import { NUMBER_FORMAT_CURRENCY } from '#utils/constants'
import { cookieName, cookieOptions, cookiePreHandler } from './_utils.js'

const schema = {
  body: {
    type: 'object',
    required: ['id'],
    properties: {
      id: {
        type: 'number'
      }
    }
  }
}

const handler = async (request, response) => {
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

  response.cookie(cookieName, sign(request.cart), cookieOptions())
  response.send(request.cart)
}

export default async (App) => {
  App.route({
    method: 'POST',
    url: '/shop/cart/remove',
    schema,
    onRequest: cacheNoStoreHeader,
    preHandler: cookiePreHandler,
    handler
  })
}

import { getReducedProduct } from '#data/shop/product'
import { cacheNoStore as cacheNoStoreHeader } from '#hooks/header'
import { sign } from '#libs/jwt'
import { NUMBER_FORMAT_CURRENCY } from '#utils/constants'
import { cookieName, cookieOptions, cookiePreHandler } from './_utils.js'

const schema = {
  body: {
    type: 'object',
    required: ['id', 'quantity', 'module'],
    properties: {
      id: {
        type: 'number'
      },
      module: {
        type: 'number'
      },
      quantity: {
        type: 'number'
      }
    }
  }
}

const handler = async (request, response) => {
  const { id, quantity } = request.body
  const { price, module, name } = await getReducedProduct(id)

  if (request.body.module !== module) {
    response.clearCookie(cookieName)
    response.code(422).send({
      error: 'id/module missmatch',
      message: 'cart has been reset!'
    })
    return
  }

  let cartTotal = 0

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

  response.cookie(cookieName, sign(request.cart), cookieOptions())
  response.send(request.cart)
}

export default async (App) => {
  App.route({
    method: 'POST',
    url: '/shop/cart/add',
    schema,
    onRequest: cacheNoStoreHeader,
    preHandler: cookiePreHandler,
    handler
  })
}
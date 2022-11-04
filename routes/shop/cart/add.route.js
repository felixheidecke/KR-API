import { getProductPrice } from '#data/shop/product'
import { cacheNoStore as cacheNoStoreHeader } from '#hooks/header'
import { sign } from '#libs/jwt'
import { NUMBER_FORMAT_CURRENCY } from '#utils/constants'
import { cookieName, cookieOptions } from './_utils.js'

const schema = {
  body: {
    type: 'object',
    required: ['id', 'quantity'],
    properties: {
      id: {
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
  const cartProducts = new Map(Object.entries(request.cart.products))
  let cartTotal = 0

  // Product data
  const productPrice = await getProductPrice(id)
  const productSubtotal = productPrice * quantity

  cartProducts.set(id, {
    price: {
      value: productPrice,
      formatted: NUMBER_FORMAT_CURRENCY.format(productPrice)
    },
    subtotal: {
      value: productSubtotal,
      formatted: NUMBER_FORMAT_CURRENCY.format(productSubtotal)
    },
    quantity
  })

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
    url: '/shop/cart/add',
    schema,
    onRequest: cacheNoStore,
    preHandler: cacheNoStoreHeader,
    handler
  })
}

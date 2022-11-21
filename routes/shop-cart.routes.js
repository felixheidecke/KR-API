import { cacheNoStore as setCacheNoStoreHeader } from '#hooks/header'
import {
  addToCartController,
  getCartController,
  removeFromCartController,
  resetCartController,
  helper as cartHelper
} from '../controller/shop-cart.controller.js'

export default async (App) => {
  // Get cart info
  App.route({
    ...routeTemplate,
    method: 'GET',
    url: '/shop/cart',
    handler: getCartController
  })

  // Add product to cart
  App.route({
    ...routeTemplate,
    method: 'PATCH',
    url: '/shop/cart/add',
    schema: {
      body: {
        type: 'object',
        required: ['id', 'quantity', 'module'],
        properties: {
          id: { type: 'number' },
          module: { type: 'number' },
          quantity: { type: 'number' }
        }
      }
    },
    handler: addToCartController
  })

  // Remove item from cart
  App.route({
    method: 'PATCH',
    url: '/shop/cart/remove',
    schema: {
      body: {
        type: 'object',
        required: ['id'],
        properties: {
          id: { type: 'number' }
        }
      }
    },
    handler: removeFromCartController
  })

  // Reset Cart
  App.route({
    method: 'DELETE',
    url: '/shop/cart',
    handler: resetCartController
  })
}

const routeTemplate = {
  onRequest: setCacheNoStoreHeader,
  preHandler: async (request) => {
    const cookie = request.cookies[cartHelper.cookieName]
    request.cart = cookie
      ? verify(cookie)
      : {
          module: 0,
          products: {},
          total: 0
        }
  }
}

import { cacheNoStore as setCacheNoStoreHeader } from '#hooks/header'
import { verify } from '#libs/jwt'
import { CART_COOKIE_NAME, CART_DEFAULT_DATA } from '#utils/shop-cart'
import * as controller from '#controller/shop-cart'

export default async (App) => {
  // Get cart info
  App.route({
    ...routeTemplate,
    method: 'GET',
    url: '/shop/cart',
    handler: controller.getCartController
  })

  // Add product to cart
  App.route({
    ...routeTemplate,
    method: 'PATCH',
    url: '/shop/cart/add',
    schema: {
      body: {
        type: 'object',
        required: ['id', 'module'],
        properties: {
          id: { type: 'string' }, // String, because used as Map().key
          module: { type: 'number' }
        }
      }
    },
    handler: controller.addToCartController
  })

  // Update product in cart
  App.route({
    ...routeTemplate,
    method: 'PATCH',
    url: '/shop/cart/update',
    schema: {
      body: {
        type: 'object',
        required: ['id', 'quantity', 'module'],
        properties: {
          id: { type: 'string' }, // String, because used as Map().key
          module: { type: 'number' },
          quantity: { type: 'number' }
        }
      }
    },
    handler: controller.updateCartController
  })

  // Reset Cart
  App.route({
    method: 'DELETE',
    url: '/shop/cart',
    handler: controller.resetCartController
  })
}

const routeTemplate = {
  onRequest: setCacheNoStoreHeader,
  preHandler: async (request, response) => {
    const token = request.cookies[CART_COOKIE_NAME]

    try {
      request.cart = token ? verify(token) : CART_DEFAULT_DATA
    } catch (error) {
      response.code(400).send(error)
    }
  }
}

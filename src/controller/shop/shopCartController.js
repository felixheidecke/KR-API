import { cacheNoStoreHook } from '#hooks/headerHooks'
import ShopCart from '#model/shop/shopCartModel'

export default async (App) => {
  App.addHook('onSend', cacheNoStoreHook)

  /**
   * - Create a new shop instance
   * - Import the token (if it exists)
   */

  App.addHook('preHandler', async function (request) {
    const { params, session } = request
    const cart = new ShopCart(params.module)

    if (session.cart) {
      cart.import(session.cart)
    }

    request.__cart = cart
  })

  /**
   * Returns the current cart
   */

  App.get('/shop/:module/cart', {
    schema: {
      params: {
        type: 'object',
        properties: {
          module: {
            type: 'number'
          }
        }
      }
    },
    handler: async (request, response) => {
      const { __cart: cart } = request

      await cart.calculate()

      response.send(cart.data)
    }
  })

  /**
   * Update the amount of an item.
   * 0 removes it from the cart.
   */

  App.post('/shop/:module/cart', {
    schema: {
      params: {
        type: 'object',
        properties: {
          module: { type: 'number' }
        }
      },
      body: {
        type: 'object',
        required: ['id'],
        properties: {
          id: {
            type: 'number'
          },
          quantity: {
            type: 'number',
            default: 1
          }
        }
      }
    },
    handler: async (request, response) => {
      const { __cart: cart, body, session } = request

      await cart.updateItemQuantity(body.id, body.quantity)
      await cart.calculate()

      session.cart = cart.export()

      response.send(cart.data)
    }
  })

  App.delete('/shop/:module/cart', {
    handler: async (request, response) => {
      request.session.destroy()
      response.code(202).send()
    }
  })
}

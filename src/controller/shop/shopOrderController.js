import { cacheNoStoreHook } from '#hooks/headerHooks'
import ShopCart from '#model/shop/shopCartModel'
import ShopOrder from '#model/shop/shopOrderModel'

export default async (App) => {
  App.addHook('onRequest', cacheNoStoreHook)

  App.addHook('preHandler', async function (request) {
    const { params, session } = request
    const order = new ShopOrder(params.module)

    if (session.order) {
      order.import(session.order)
    }

    request.__order = order
  })

  App.get(
    '/shop/:module/order/:transactionId',
    async function (request, response) {
      const { __order: order, params } = request

      await order.load(params.transactionId)

      if (order.errors?.notFound) {
        App.clientErrorHandler(response, 404, {
          error: 'Not Found',
          code: 'NOT_FOUND',
          message: 'No Order found with id ' + params.transactionId
        })
      } else {
        response.send(order.data)
      }
    }
  )

  App.post('/shop/:module/order/address', {
    handler: async (request, response) => {
      const { __order: order, session, body: address } = request

      try {
        order.address = address
        order.message = address.message || ''

        if (order.errors) {
          App.clientErrorHandler(response, 422, {
            error: 'Unprocessable Entity',
            message: 'Invalid or missing data for order creation.',
            payload: order.errors
          })
        } else {
          session.order = order.export()
          response.code(202)
        }
      } catch (error) {
        App.catchHandler(response, error)
      }
    }
  })

  App.post('/shop/:module/order', {
    /**
     * - Create a new shop instance
     * - Import the token (if it exists)
     */

    preHandler: async function (request, response) {
      const { params, session } = request

      if (!session.cart) {
        App.clientErrorHandler(response, 400, {
          message: 'Missing cart data.',
          code: 'NO_CART'
        })
        return
      }

      const cart = new ShopCart(params.module)

      cart.import(session.cart)

      request.__cart = cart
    },

    handler: async (request, response) => {
      const { __cart: cart, __order: order, session } = request

      // Insert cart data
      order.total = cart.total.value
      order.shippingCost = cart.shipping.value
      order.products = cart.products

      await order.save()

      if (order.errors) {
        App.clientErrorHandler(response, 400, {
          message: 'Error while finalising order',
          error: 'ORDER_ERROR',
          payload: order.errors
        })
      } else {
        session.destroy()
        response.code(201).send({ transactionId: order.transactionId })
      }
    }
  })

  App.delete('/shop/:module/order', {
    handler: async (_, response) => {
      request.session.destroy()
      response.code(205).send()
    }
  })
}

import { cacheNoStore as setCacheNoStoreHeader } from '#hooks/header'
import * as paypal from '#libs/paypal'
import { ShopCart } from '#model/shop-cart'

const routeTemplate = {
  onRequest: setCacheNoStoreHeader,

  preHandler: async (request, response) => {
    const { body } = request
    const cart = new ShopCart()

    try {
      cart.token = body.token
      request.cart = cart
    } catch (error) {
      console.error(error)
      response.status(400).send(error)
    }
  }
}

const shopOrderController = {
  ...routeTemplate,

  method: 'POST',

  url: '/shop/order',

  schema: {
    body: {
      type: 'object',
      required: ['token'],
      properties: {
        token: { type: 'string' }
      }
    }
  },

  handler: async ({ cart }, response) => {
    const total = (await cart.get()).total

    try {
      const order = await paypal.createOrder(cart.module, total.value)

      response.send(order)
    } catch (error) {
      console.log(error)
      response.status(400).send(error)
    }
  }
}

const shopCaptureOrderController = {
  ...routeTemplate,

  method: 'POST',

  url: '/shop/order/:id/capture',

  schema: {
    body: {
      type: 'object',
      required: ['token'],
      properties: {
        token: { type: 'string' }
      }
    },
    params: {
      type: 'object',
      required: ['id'],
      properties: {
        token: { type: 'string' }
      }
    }
  },

  async handler({ cart, params }, response) {
    try {
      const payment = await paypal.capturePayment(cart.module, params.id)

      response.send(payment)
    } catch (error) {
      console.log(error)
      response.status(400).send(error)
    }
  }
}

export default async (App) => {
  App.route(shopOrderController)
  App.route(shopCaptureOrderController)
}

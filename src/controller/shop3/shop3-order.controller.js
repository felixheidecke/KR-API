import { cacheNoStore as setCacheNoStoreHeader } from '#src/hooks/headerHooks'
import * as cache from '#src/hooks/cacheHooks'
import * as paypal from '#libs/paypal'
import { notFoundHandler } from '#src/utils/controller.utils.js'
import { verify } from '#src/libs/jwt.js'
import createOrderSchema from '#src/schemas/shop3/createOrder.schema.json' assert { type: 'json' }
import { Shop3Order } from '#src/model/shop3/order.model.js'

const routeTemplate = {
  onRequest: setCacheNoStoreHeader,
  preHandler: async (request, response) => {
    const { body } = request

    try {
      request.total = verify(body.token).total
    } catch (error) {
      console.error({ error })
      response.status(400).send({ message: 'invalid token!' })
    }
  }
}

const getOrderController = {
  method: 'GET',
  url: '/shop/:module/order/:transactionId',
  onRequest: [
    cache.onRequest,
    async (request) => {
      request.cache = {
        ...request.cache,
        redisTTL: 600000, // About a week
        browserTTL: 2500000 // About a month
      }
    }
  ],
  preHandler: cache.preHandler,
  handler: async (request, response) => {
    const { transactionId } = request.params
    const order = new Shop3Order()

    try {
      await order.fetch(transactionId)

      if (!order.exists()) {
        notFoundHandler(response)
        return
      }

      request.data = order.getAll()
      response.send(request.data)
    } catch (error) {
      console.log(error)
      response.status(400).send(error)
    }
  },
  onResponse: cache.onResponse
}

const createPaypalOrderController = {
  ...routeTemplate,
  method: 'POST',
  url: '/shop/:module/order/paypal/create',
  schema: {
    body: {
      type: 'object',
      required: ['token'],
      properties: {
        token: { type: 'string' }
      }
    }
  },
  handler: async ({ total, params }, response) => {
    console.log(params.module, total)

    try {
      const order = await paypal.createOrder(params.module, total)

      response.send(order)
    } catch (error) {
      console.log(error)
      response.status(400).send(error)
    }
  }
}

const createOrderController = {
  ...routeTemplate,
  method: 'POST',
  url: '/shop/:module/order/create',
  schema: createOrderSchema,
  async handler(request, response) {
    const { body } = request
    const cart = verify(body.token)
    const order = new Shop3Order()

    order
      .setType(body.type)
      .setAddress(body.invoice)
      .setMessage(body.message)
      .setTotal(cart.total)
      .setShippingCost(cart.shipping)
      .setModule(cart.module)

    cart.products.forEach((product) => order.addProduct(product))

    await order.save()

    response.code(201).send({
      message: 'success',
      transactionId: order.transactionId
    })
  }
}

const capturePaypalOrderController = {
  ...routeTemplate,
  method: 'POST',
  url: '/shop/:module/order/paypal/capture',
  schema: {
    body: {
      type: 'object',
      required: ['id'],
      properties: {
        id: { type: 'string' }
      }
    }
  },

  async handler({ params }, response) {
    try {
      const payment = await paypal.capturePayment(params.module, params.id)

      response.send(payment)
    } catch (error) {
      console.log(error)
      response.status(400).send(error)
    }
  }
}

export default async (App) => {
  App.route(getOrderController)
  App.route(createOrderController)
  App.route(createPaypalOrderController)
  App.route(capturePaypalOrderController)
}

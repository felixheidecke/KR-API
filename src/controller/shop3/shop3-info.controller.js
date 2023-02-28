import { catchHandler } from '#utils/controller'
import { Shop3Info } from '#src/model/shop3/info.model.js'
import * as cache from '#hooks/cache'

const shopInfoController = {
  method: 'GET',

  url: '/shop/:module/info',

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
    const shop = new Shop3Info()
    shop.module = request.params.module

    try {
      const [owner, charges, rates] = await Promise.all([
        shop.owner(),
        shop.shippingCharges(),
        shop.shippingRates()
      ])

      request.data = {
        ...owner,
        shipping: {
          ...charges,
          rates
        }
      }

      response.send(request.data)
    } catch (error) {
      catchHandler(response, error)
    }
  },

  onRequest: cache.onRequest,

  preHandler: cache.preHandler,

  onResponse: cache.onResponse
}

export default async (App) => {
  App.route(shopInfoController)
}

import {
  getOwnerInfo,
  getShippingCharges,
  getShippingRates
} from '#data/shop/config'
import cache from '#hooks/cache'
import { shippingChargesAdapter, shippingRateAdapter } from './_utils.js'

export default async (App) => {
  App.route({
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

    onRequest: cache.onRequest,

    preHandler: cache.preHandler,

    handler: async (request, response) => {
      const { module } = request.params

      try {
        const [owner, charges, rates] = await Promise.all([
          getOwnerInfo(module),
          getShippingCharges(module),
          getShippingRates(module)
        ])

        const data = {
          ...owner,
          shipping: {
            ...shippingChargesAdapter(charges),
            rates: rates.map((rate) => shippingRateAdapter(rate))
          }
        }

        response.send(data)
        request.cache.data = data
        request.cache.shouldSave = true
        request.log.info(`Serving ${request.url} from Database`)
      } catch (error) {
        console.error({ error })
        response.code(500).send({ error: 'Internal Server Error!' })
      }
    },

    onResponse: cache.onResponse
  })
}

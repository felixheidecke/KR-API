import cache from '#hooks/cache'
import { getProduct } from '#data/shop/product'

export default async (App) => {
  App.route({
    method: 'GET',

    url: '/shop/product/:id',

    schema: {
      params: {
        type: 'object',
        properties: {
          id: {
            type: 'number'
          }
        }
      }
    },

    onRequest: cache.onRequest,

    preHandler: cache.preHandler,

    handler: async (request, response) => {
      const { id } = request.params

      try {
        const data = await getProduct(id)

        if (!data) {
          response.code(400).send({ error: `No product found for id ${id}` })
        } else {
          response.send(data)
          request.cache.data = data
          request.cache.shouldSave = true
          request.log.info(`Serving ${request.url} from Database`)
        }
      } catch (error) {
        console.error({ error })
        response.code(500).send({ error: 'Internal Server Error!' })
      }
    },

    onResponse: cache.onResponse
  })
}

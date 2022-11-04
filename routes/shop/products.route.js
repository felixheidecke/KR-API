import cache from '#hooks/cache'
import { getProducts } from '#data/shop/product'

export default async (App) => {
  App.route({
    method: 'GET',

    url: '/shop/:module/products',

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
        const data = await getProducts(module)

        if (!data.length) {
          response
            .header('content-type', 'text/plain')
            .code(404)
            .send(`No Products found for module ${module}`)
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

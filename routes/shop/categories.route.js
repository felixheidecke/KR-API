import cache from '#hooks/cache'

export default async (App) => {
  App.route({
    method: 'GET',

    url: '/shop/:module/categories',

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
        const data = getCategories(module)

        if (!category) {
          response
            .code(404)
            .send({ error: `No product found for module ${module}` })
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

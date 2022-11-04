import cache from '#hooks/cache'
import { getEvents } from '#data/events'

export default async (App) => {
  App.route({
    method: 'GET',

    url: '/events/:module',

    schema: {
      query: {
        type: 'object',
        properties: {
          limit: {
            type: 'number'
          }
        }
      }
    },

    onRequest: cache.onRequest,

    preHandler: cache.preHandler,

    /**
     * Getting articles by their module (id)
     *
     * @param {object} request Fastify request object
     * @param {object} response Fastify response object
     * @returns {Promise<void>}
     */

    handler: async (request, response) => {
      // Request params
      const { module } = request.params
      const { query } = request

      try {
        let events = await getEvents(module, query)

        response.send(events)
        request.cache.data = events
        request.cache.shouldSave = !!events.length
      } catch (error) {
        console.error({ error })
        response.code(500).send({ error: 'Internal Server Error!' })
      }
    },

    onResponse: cache.onResponse
  })
}

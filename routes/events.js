import cache from '#hooks/cache'
import { getEvents } from '#data/events'
import { sortBy } from 'lodash-es'

export default async (App) => {
  App.route({
    method: 'GET',

    url: '/events',

    schema: {
      query: {
        type: 'object',
        properties: {
          limit: {
            type: 'number'
          },
          module: {
            type: 'array'
          },
          communes: {
            type: 'array'
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
      if (request.cache.data) {
        response.send(request.cache.data)
        return
      }

      try {
        let events = await getEvents(request.query)

        if (!events) {
          response.code(400).send({ error: `No events found` })
        } else {
          events = sortBy(events, 'starts')

          response.send(events)
          request.cache.data = events
          request.cache.shouldSave = true
        }
      } catch (error) {
        console.error({ error })
        response.code(500).send({ error: 'Internal Server Error!' })
      }
    },

    onResponse: cache.onResponse
  })
}

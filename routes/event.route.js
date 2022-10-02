import cache from '#hooks/cache'
import { getEvent } from '#data/events.data'

export default async (App) => {
  App.route({
    method: 'GET',

    url: '/event/:id',

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
      const { id } = request.params

      if (request.cache.data) {
        response.send(request.cache.data)
        return
      }

      try {
        let events = await getEvent(id)

        if (!events) {
          response.code(400).send({ error: `No event found for id ${id}` })
        } else {
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

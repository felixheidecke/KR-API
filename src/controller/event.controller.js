import * as cache from '#hooks/cache'
import { getEvent } from '#data/event'
import { getEvents } from '#data/events'
import { catchHandler, sendNotFoundHandler } from '#utils/controller'

const routeTemplate = {
  method: 'GET',
  onRequest: cache.onRequest,
  preHandler: cache.preHandler,
  onResponse: cache.onResponse
}

/**
 * @param {import("fastify").FastifyRequest} request Fastify request object
 * @param {import("fastify").FastifyReply} response Fastify response object
 */

const getEventController = {
  ...routeTemplate,
  url: '/events/:module',
  schema: {
    params: {
      type: 'object',
      required: ['module'],
      properties: {
        module: { type: 'number' }
      }
    },
    query: {
      type: 'object',
      properties: {
        limit: { type: 'number' },
        expired: { type: 'boolean' }
      }
    }
  },
  handler: async (request, response) => {
    const { module } = request.params // is module
    const { query } = request

    request.shouldSave = false
    try {
      const events = await getEvents(module, query)
      request.data = events.get().map(({ get }) => get())

      if (!request.data) {
        sendNotFoundHandler(response)
      } else {
        response.send(request.data)
      }
    } catch (error) {
      catchHandler(response, error)
    }
  }
}

/**
 * @param {import("fastify").FastifyRequest} request Fastify request object
 * @param {import("fastify").FastifyReply} response Fastify response object
 */

const getEventsController = {
  ...routeTemplate,
  url: '/event/:id',
  schema: {
    params: {
      type: 'object',
      required: ['id'],
      properties: {
        id: { type: 'number' }
      }
    }
  },
  handler: async (request, response) => {
    // Request params
    const { id } = request.params

    console.log('getEventController', request.cache.shouldSave)

    try {
      const event = await getEvent(id)
      request.data = event.get()

      if (!request.data) {
        sendNotFoundHandler(response)
      } else {
        response.send(request.data)
      }
    } catch (error) {
      catchHandler(response, error)
    }
  }
}

export default async (App) => {
  App.route(getEventController)
  App.route(getEventsController)
}

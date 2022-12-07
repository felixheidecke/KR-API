import * as cache from '#hooks/cache'
import { getEvent, getEvents } from '#data/events'
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
  url: '/events/:id',
  schema: {
    params: {
      type: 'object',
      required: ['id'],
      properties: {
        id: { type: 'number' }
      }
    },
    query: {
      type: 'object',
      properties: {
        limit: { type: 'number' }
      }
    }
  },
  handler: async (request, response) => {
    const { id } = request.params // is module
    const { query } = request

    try {
      request.data = await getEvents(id, query)

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
      request.data = await getEvent(id)

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

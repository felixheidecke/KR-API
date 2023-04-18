import * as cache from '#hooks/cache'
import { getEvent } from '#data/event'
import { getEvents } from '#data/events'
import { catchHandler, sendNotFoundHandler } from '#utils/controller'
import { pick } from 'lodash-es'
import { valiDate } from '#helper/vali-date'

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

const getEventsController = {
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
        startsAfter: { type: 'string' },
        startsBefore: { type: 'string' },
        endsAfter: { type: 'string' },
        endsBefore: { type: 'string' }
      }
    }
  },
  preValidation: async (request, response) => {
    const { query } = request
    const invalidDates = []

    if (query.startsAfter && !valiDate(query.startsAfter)) {
      invalidDates.push('startsAfter')
    }
    if (query.startsBefore && !valiDate(query.startsBefore)) {
      invalidDates.push('startsBefore')
    }
    if (query.endsAfter && !valiDate(query.endsAfter)) {
      invalidDates.push('endsAfter')
    }
    if (query.endsBefore && !valiDate(query.endsBefore)) {
      invalidDates.push('endsBefore')
    }

    if (invalidDates.length) {
      response
        .code(400)
        .send({ error: `Invalid Date format in ${invalidDates.join(', ')}` })
    }
  },
  handler: async (request, response) => {
    const { module } = request.params // is module
    const query = pick(request.query, [
      'endsAfter',
      'endsBefore',
      'limit',
      'startsAfter',
      'startsBefore'
    ])

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

const getEventController = {
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

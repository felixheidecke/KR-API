import { EventService } from '../services/EventService.js'
import { getEventRequestSchema } from '../schemas/getEventRequestSchema.js'
import { getEventsRequestSchema } from '../schemas/getEventsRequestSchema.js'
import { Event } from '../entities/Event.js'

import type { FastifyInstance } from 'fastify'
import type { GetEventRequestSchema } from '../schemas/getEventRequestSchema.js'
import type { GetEventsRequestSchema } from '../schemas/getEventsRequestSchema.js'
import type { InferFastifyRequest } from '../../../common/types/InferFastifyRequest.js'

export default async function (App: FastifyInstance) {
  App.get('/events/:module/:id', {
    preValidation: async function (request: InferFastifyRequest<GetEventRequestSchema>) {
      const { params, query } = getEventRequestSchema.parse(request)
      request.params = params
      request.query = query
    },
    handler: async function (request, reply) {
      const { module, id } = request.params
      const event = await EventService.getEvent(module, id, { shouldThrow: true })

      request.data = (event as Event).display()

      reply.send(request.data)
    }
  })

  App.get('/events/:module', {
    preValidation: async function (request: InferFastifyRequest<GetEventsRequestSchema>) {
      const { params, query } = getEventsRequestSchema.parse(request)
      request.params = params
      request.query = query
    },
    handler: async function (request, reply) {
      const { params, query } = request
      const events = await EventService.getEvents(params.module, query, {
        shouldThrow: true
      })

      request.data = (events as Event[]).map(event => event.display())

      reply.send(request.data)
    }
  })
}

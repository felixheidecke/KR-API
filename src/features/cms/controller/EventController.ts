import { EventService } from '../services/EventService.js'
import { getEventRequestSchema } from '../schemas/getEventRequestSchema.js'
import { getEventsRequestSchema } from '../schemas/getEventsRequestSchema.js'

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
      const { params } = request
      const event = await EventService.getEvent(params.module, params.id)
      request.data = event.display()

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
      const events = await EventService.getEvents(params.module, query, query.detailLevel)
      request.data = events.map(event => event.display())

      reply.send(request.data)
    }
  })
}

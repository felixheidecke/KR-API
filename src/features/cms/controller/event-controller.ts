import { HttpError } from '#utils/http-error.js'
import { omit, pick } from 'lodash-es'
import { EventService } from '../services/event-service.js'
import { getEventRequestSchema, getEventsQueryRequestSchema } from '../schemas/events-schema.js'
import { getEventsRequestSchema } from '../schemas/events-schema.js'

// --- [ Types ] -----------------------------------------------------------------------------------

import type { FastifyInstance } from 'fastify'
import type { InferFastifyRequest } from '#libs/fastify.js'
import type { z } from 'zod'

type GetEventRequestSchema = InferFastifyRequest<z.infer<typeof getEventRequestSchema>>
type GetEventsRequestSchema = InferFastifyRequest<z.infer<typeof getEventsRequestSchema>>
type GetEventsQueryRequestSchema = InferFastifyRequest<z.infer<typeof getEventsQueryRequestSchema>>

// --- [ Controller ] ------------------------------------------------------------------------------

export default async function (App: FastifyInstance) {
  App.get('/events/query', {
    preHandler: async function (request: GetEventsQueryRequestSchema) {
      if (!request.client.isSuperuser) {
        throw HttpError.FORBIDDEN()
      }

      const { query } = getEventsQueryRequestSchema.parse(request)

      request.query = query
    },
    handler: async function (request, reply) {
      const whereIn = pick(request.query, 'modules', 'communes', 'tags')
      const query = omit(request.query, 'modules', 'communes', 'tags')
      const events = await EventService.getEventsWhereIn(whereIn, query)

      request.data = events.map(event => event.display())

      reply.send(request.data)
    }
  })

  App.get('/events/:module/:id', {
    preValidation: async function (request: GetEventRequestSchema) {
      const { params } = getEventRequestSchema.parse(request)

      request.params = params
    },
    handler: async function (request, reply) {
      const { module, id } = request.params
      const event = await EventService.getEventById(module, id)

      request.data = event.display()

      reply.send(request.data)
    }
  })

  App.get('/events/:module', {
    preValidation: async function (request: GetEventsRequestSchema) {
      const { params, query } = getEventsRequestSchema.parse(request)

      request.params = params
      request.query = query
    },
    handler: async function (request, reply) {
      const { params, query } = request
      const events = await EventService.getEventsByModule(params.module, query)

      request.data = events.map(event => event.display())

      reply.send(request.data)
    }
  })
}

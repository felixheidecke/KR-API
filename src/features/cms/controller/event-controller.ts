import { EventService } from '../services/event-service.js'
import {
  getEventRequestSchema,
  getEventsQueryRequestSchema
} from '../schemas/events-request-schema.js'
import { getEventsRequestSchema } from '../schemas/events-request-schema.js'
import { Event } from '../entities/event.js'

import type { FastifyInstance } from 'fastify'
import type {
  GetEventRequestSchema,
  GetEventsQueryRequestSchema
} from '../schemas/events-request-schema.js'
import type { GetEventsRequestSchema } from '../schemas/events-request-schema.js'
import type { InferFastifyRequest } from '#libs/fastify.js'
import { HttpError } from '#utils/http-error.js'
import { omit, pick } from 'lodash-es'

export default async function (App: FastifyInstance) {
  App.get('/events/query', {
    preHandler: async function (request: InferFastifyRequest<GetEventsQueryRequestSchema>) {
      if (!request.client.isSuperuser) {
        throw HttpError.FORBIDDEN()
      }

      const { query } = getEventsQueryRequestSchema.parse(request)

      request.query = query
    },
    handler: async function (request, reply) {
      const whereIn = pick(request.query, 'modules', 'communes')
      const query = omit(request.query, 'modules', 'communes')
      const events = await EventService.getEventsWhereIn(whereIn, query)

      request.data = (events as Event[]).map(event => event.display())

      reply.send(request.data)
    }
  })

  App.get('/events/:module/:id', {
    preValidation: async function (request: InferFastifyRequest<GetEventRequestSchema>) {
      const { params } = getEventRequestSchema.parse(request)

      request.params = params
    },
    handler: async function (request, reply) {
      const { module, id } = request.params
      const event = await EventService.getEventById(module, id, { shouldThrow: true })

      request.data = (event as Event).display()

      reply.send(request.data)
    }
  })

  App.get('/events/:module', {
    preValidation: async function (request: InferFastifyRequest<GetEventsRequestSchema>) {
      const { params, query } = getEventsRequestSchema.parse(request)

      request.params = params
      request.query = query

      console.log(request.query)
    },
    handler: async function (request, reply) {
      const { params, query } = request
      const events = await EventService.getEventsByModule(params.module, query, {
        shouldThrow: true
      })

      request.data = (events as Event[]).map(event => event.display())

      reply.send(request.data)
    }
  })
}

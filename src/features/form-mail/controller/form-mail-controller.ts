import { formMailRequestSchema, type FormMailRequestSchema } from '../schemas/form-mail-schema.js'
import { FormMailService } from '../services/form-mail-service.js'

import type { InferFastifyRequest } from '#libs/fastify.js'
import type { FastifyInstance } from 'fastify'

export default async (App: FastifyInstance) => {
  App.post('/send', {
    preValidation: async function (request: InferFastifyRequest<FormMailRequestSchema>) {
      const { body, query } = formMailRequestSchema.parse(request)
      request.body = body
      request.query = query
    },
    handler: async (request, reply) => {
      const { config, body } = request.body
      const { query } = request
      const recipients = config.to.split(',')

      const { messageId } = await FormMailService.send(recipients, config.subject, body, {
        attachBodyAsCSV: query.attachBodyAsCSV
      })

      reply.code(201).send({ messageId })
    }
  })
}

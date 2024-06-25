import { formMailSchema, type FormMailSchema } from '../schemas/formMailSchema.js'
import { FormMailService } from '../services/FormMailService.js'

import type { FastifyInstance } from 'fastify'
import type { InferFastifyRequest } from '../../../common/types/InferFastifyRequest.js'

export default async (App: FastifyInstance) => {
  App.post('/send', {
    preValidation: async function (request: InferFastifyRequest<FormMailSchema>) {
      const { body, query } = formMailSchema.parse(request)
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

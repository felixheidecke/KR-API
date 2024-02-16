import { formMailSchema, type FormMailSchema } from '../schemas/formMailSchema.js'
import { FormMailService } from '../services/FormMailService.js'

import type { FastifyInstance } from 'fastify'
import type { InferFastifyRequest } from '../../../common/types/InferFastifyRequest.js'

export default async (App: FastifyInstance) => {
  App.post('/send', {
    preValidation: async function (request: InferFastifyRequest<FormMailSchema>) {
      const { body } = formMailSchema.parse(request)
      request.body = body
    },
    handler: async (request, reply) => {
      const { config, body } = request.body
      const recipients = config.to.split(',')

      await FormMailService.send(recipients, config.subject, body)
      reply.code(204).send()
    }
  })
}

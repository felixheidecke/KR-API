import { getMenuCardRequestSchema } from '../schemas/menu-card-schema.js'
import { MenuCardService } from '../services/menu-card-service.js'

// --- [ Types ] -----------------------------------------------------------------------------------

import type { FastifyInstance } from 'fastify'
import type { InferFastifyRequest } from '#libs/fastify.js'
import type { z } from 'zod'

type GetMenuCardRequestSchema = InferFastifyRequest<z.infer<typeof getMenuCardRequestSchema>>

// --- [ Controller ] ------------------------------------------------------------------------------

export default async (App: FastifyInstance) => {
  App.get('/menu-card/:module', {
    preValidation: async (request: GetMenuCardRequestSchema) => {
      const { params } = getMenuCardRequestSchema.parse(request)

      request.params = params
    },
    handler: async (request, reply) => {
      const { module } = request.params
      const menuCard = await MenuCardService.getMenuCardByModule(module)

      request.data = menuCard.map(card => card.display())

      reply.send(request.data)
    }
  })
}

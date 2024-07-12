import { getMenuCardRequestSchema } from '../schemas/get-menu-card-request-schema.js'
import { MenuCardService } from '../services/menu-card-service.js'

import type { FastifyInstance } from 'fastify'
import type { GetMenuCardRequestSchema } from '../schemas/get-menu-card-request-schema.js'
import type { InferFastifyRequest } from '#libs/fastify.js'

export default async (App: FastifyInstance) => {
  /**
   * GET route to retrieve a menu card for a specific module.
   * Validates request using 'GetMenuCardRequestSchema'.
   *
   * @param {string} '/menu-card/:module' - Endpoint to get a menu card for a specific module.
   * @param {object} options - Route configuration object.
   * @param {Function} options.preValidation - Pre-validation function using 'GetMenuCardRequestSchema'.
   * @param {Function} options.handler - Async handler function for the route.
   */

  App.get('/menu-card/:module', {
    preValidation: async (request: InferFastifyRequest<GetMenuCardRequestSchema>) => {
      getMenuCardRequestSchema.parse(request)
    },
    handler: async (request, reply) => {
      const { module } = request.params
      const menuCard = await MenuCardService.getMenuCard(module, {
        shouldThrow: true
      })

      request.data = menuCard?.map(card => card.display())

      reply.send(request.data)
    }
  })
}

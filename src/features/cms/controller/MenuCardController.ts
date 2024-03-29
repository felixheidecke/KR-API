import { getMenuCardRequestSchema } from '../schemas/getMenuCardRequestSchema.js'
import { MenuCardService } from '../services/MenuCardService.js'

import type { FastifyInstance } from 'fastify'
import type { GetMenuCardRequestSchema } from '../schemas/getMenuCardRequestSchema.js'
import type { InferFastifyRequest } from '../../../common/types/InferFastifyRequest.js'

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
      const menuCard = await MenuCardService.getMenuCard(module)

      reply.send(menuCard?.map(card => card.display()))
    }
  })
}

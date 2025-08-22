import { CustomerService } from '../services/customer-service.js'
import { getProductsRequestSchema } from '../schemas/product-schema.js'
import { ShippingCostService } from '../services/shipping-cost-service.js'
import { SupplementalCostService } from '../services/supplemental-cost-service.js'
import { toSeconds } from '#utils/convert-time.js'
import caching from '#plugins/caching/index.js'

import type { FastifyInstance } from 'fastify'
import type { getInfoRequestSchema } from '../schemas/info-schema.js'
import type { InferFastifyRequest } from '#libs/fastify.js'
import type { z } from 'zod'

type GetInfoRequestSchema = InferFastifyRequest<z.infer<typeof getInfoRequestSchema>>

export default async function InfoController(App: FastifyInstance) {
  App.register(caching, {
    browserTTL: toSeconds({ hours: 300 })
  })

  App.get('/:module/info', {
    preValidation: async function (request: GetInfoRequestSchema) {
      const { params } = getProductsRequestSchema.parse(request)

      request.params = params
    },
    handler: async function (request, reply) {
      const { module } = request.params

      const [customer, shippingCost, supplementalCost] = await Promise.all([
        CustomerService.getCustomerByModule(module),
        ShippingCostService.getShippingCost(module),
        SupplementalCostService.getSupplementalCost(module)
      ])

      request.data = {
        owner: customer.display(),
        shippingCost: shippingCost.display(),
        supplementalCost: supplementalCost.display()
      }

      reply.send(request.data)
    }
  })
}

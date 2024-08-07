import { GroupService } from '../services/group-service.js'
import { ProductService } from '../services/product-service.js'
import { toSeconds } from '#utils/convert-time.js'
import {
  getGroupProductsRequestSchema,
  getGroupRequestSchema,
  getGroupsRequestSchema
} from '../schemas/group-schema.js'
import caching from '#plugins/caching/index.js'

import type { FastifyInstance } from 'fastify'
import type { Group } from '../entities/group.js'
import type { InferFastifyRequest } from '#libs/fastify.js'
import type { z } from 'zod'

type GetGroupsRequestSchema = InferFastifyRequest<z.infer<typeof getGroupsRequestSchema>>
type GetCategoryRequestSchema = InferFastifyRequest<z.infer<typeof getGroupRequestSchema>>
type GetCategoryProductsRequestSchema = InferFastifyRequest<
  z.infer<typeof getGroupProductsRequestSchema>
>

export default async function GroupController(App: FastifyInstance) {
  App.register(caching, {
    redisTTL: toSeconds({ minutes: 15 }),
    browserTTL: toSeconds({ minutes: 45 })
  })

  App.get('/:module/groups', {
    preValidation: async (request: GetGroupsRequestSchema) => {
      const { params } = getGroupsRequestSchema.parse(request)

      request.params = params
    },
    handler: async (request, reply) => {
      const { params } = request
      const groups = await GroupService.getGroups(params.module)

      request.data = groups.map(category => category.display())

      reply.send(request.data)
    }
  })

  App.get('/:module/groups/:id', {
    preValidation: async (request: GetCategoryRequestSchema) => {
      const { params } = getGroupRequestSchema.parse(request)

      request.params = params
    },
    handler: async (request, reply) => {
      const { params } = request
      const group = await GroupService.getGroupById(params.module, params.id)

      request.data = group.display()

      reply.send(request.data)
    }
  })

  App.get('/:module/groups/:id/products', {
    preValidation: async (request: GetCategoryProductsRequestSchema) => {
      const { params, query } = getGroupProductsRequestSchema.parse(request)

      request.params = params
      request.query = query
    },
    handler: async (request, reply) => {
      const { params, query } = request
      const products = await ProductService.getProductsByCategory(params.module, params.id, query)

      request.data = products.map(product => product.display())

      reply.send(request.data)
    }
  })
}

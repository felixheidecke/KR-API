import { getCategoryProductsRequestSchema } from '../schemas/get-category-products-request-schema.js'
import { getCategoryRequestSchema } from '../schemas/get-category-request-schema.js'
import { getGroupsRequestSchema } from '../schemas/get-categories-request-schema.js'
import { GroupService } from '../services/group-service.js'
import { ProductService } from '../services/product-service.js'
import { toSeconds } from '#utils/convert-time.js'
import caching from '#plugins/caching/index.js'

import type { FastifyInstance } from 'fastify'
import type { Group } from '../entities/group.js'
import type { InferFastifyRequest } from '#libs/fastify.js'
import type { GetCategoryProductsRequestSchema } from '../schemas/get-category-products-request-schema.js'
import type { GetCategoryRequestSchema } from '../schemas/get-category-request-schema.js'
import type { GetGroupsRequestSchema } from '../schemas/get-categories-request-schema.js'

export default async function (App: FastifyInstance) {
  App.register(caching, {
    redisTTL: toSeconds({ minutes: 15 }),
    browserTTL: toSeconds({ minutes: 45 })
  })

  App.get('/:module/groups', {
    preValidation: async (request: InferFastifyRequest<GetGroupsRequestSchema>) => {
      getGroupsRequestSchema.parse(request)
    },
    handler: async (request, reply) => {
      const { params, query } = request
      const groups = await GroupService.getGroups(params.module, { shouldThrow: true })

      // @TODO: Implement Overload for getCategories() to skip casting to Group[]
      request.data = (groups as Group[]).map(category => category.display())

      reply.send(request.data)
    }
  })

  App.get('/:module/groups/:id', {
    preValidation: async (request: InferFastifyRequest<GetCategoryRequestSchema>) => {
      const { params } = getCategoryRequestSchema.parse(request)
      request.params = params
    },
    handler: async (request, reply) => {
      const { params } = request
      const category = await GroupService.getGroup(params.module, params.id, {
        shouldThrow: true
      })

      // @TODO: Implement Overload for getCategory() to skip casting to Group
      request.data = (category as Group).display()

      reply.send(request.data)
    }
  })

  App.get('/:module/groups/:id/products', {
    preValidation: async (request: InferFastifyRequest<GetCategoryProductsRequestSchema>) => {
      const { params, query } = getCategoryProductsRequestSchema.parse(request)
      request.params = params
      request.query = query
    },
    handler: async (request, reply) => {
      const { params, query } = request
      const products = await ProductService.getProductsByCategory(params.module, params.id, query, {
        shouldThrow: true
      })

      // @TODO: Implement Overload for getProducts() to skip casting to Product[]
      request.data = products.map(product => product.display())

      reply.send(request.data)
    }
  })
}

import { getCategoryProductsRequestSchema } from '../schemas/getCategoryProductsRequestSchema.js'
import { getCategoryRequestSchema } from '../schemas/getCategoryRequestSchema.js'
import { getGroupsRequestSchema } from '../schemas/getCategoriesRequestSchema.js'
import { GroupService } from '../services/GroupService.js'
import { ProductService } from '../services/ProductService.js'
import { toSeconds } from '../../../common/utils/convert-time.js'
import caching from '../../../common/plugins/caching.js'

import type { FastifyInstance } from 'fastify'
import type { GetGroupsRequestSchema } from '../schemas/getCategoriesRequestSchema.js'
import type { GetCategoryProductsRequestSchema } from '../schemas/getCategoryProductsRequestSchema.js'
import type { GetCategoryRequestSchema } from '../schemas/getCategoryRequestSchema.js'
import type { InferFastifyRequest } from '../../../common/types/InferFastifyRequest.js'
import type { Group } from '../entities/Group.js'

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

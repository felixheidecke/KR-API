import { CategoryService } from '../services/CategoryService.js'
import { getCategoriesRequestSchema } from '../schemas/getCategoriesRequestSchema.js'
import { getCategoryProductsRequestSchema } from '../schemas/getCategoryProductsRequestSchema.js'
import { getCategoryRequestSchema } from '../schemas/getCategoryRequestSchema.js'
import { mapDetailLevel } from '../utils/detail-level.js'
import { ProductService } from '../services/ProductService.js'
import * as caching from '../../../common/hooks/cacheHooks.js'

import type { FastifyInstance } from 'fastify'
import type { GetCategoriesRequestSchema } from '../schemas/getCategoriesRequestSchema.js'
import type { GetCategoryProductsRequestSchema } from '../schemas/getCategoryProductsRequestSchema.js'
import type { GetCategoryRequestSchema } from '../schemas/getCategoryRequestSchema.js'
import type { InferFastifyRequest } from '../../../common/types/InferFastifyRequest.js'

export default async function (App: FastifyInstance) {
  App.addHook('onRequest', caching.setupCacheHook)
  App.addHook('preHandler', caching.readCacheHook)
  App.addHook('onResponse', caching.writeCacheHook)

  App.get('/:module/categories', {
    preValidation: async (request: InferFastifyRequest<GetCategoriesRequestSchema>) => {
      getCategoriesRequestSchema.parse(request)
    },
    handler: async (request, reply) => {
      const { params, query } = request
      const categories = await CategoryService.getCategories(
        params.module,
        mapDetailLevel(query.detailLevel)
      )
      request.data = categories.map(category => category.display())

      reply.send(request.data)
    }
  })

  App.get('/:module/categories/:id', {
    preValidation: async (request: InferFastifyRequest<GetCategoryRequestSchema>) => {
      const { params, query } = getCategoryRequestSchema.parse(request)
      request.params = params
      request.query = query
    },
    handler: async (request, reply) => {
      const { params, query } = request
      const category = await CategoryService.getCategory(
        params.module,
        params.id,
        query.detailLevel
      )
      request.data = category.display()

      reply.send(request.data)
    }
  })

  App.get('/:module/categories/:id/products', {
    preValidation: async (request: InferFastifyRequest<GetCategoryProductsRequestSchema>) => {
      getCategoryProductsRequestSchema.parse(request)
    },
    handler: async (request, reply) => {
      const { params, query } = request

      const products = await ProductService.getProducts(
        params.module,
        {
          limit: query.limit,
          categoryId: params.id
        },
        mapDetailLevel(query.detailLevel)
      )
      request.data = products.map(product => product.display())

      reply.send(request.data)
    }
  })
}

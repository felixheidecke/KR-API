import { getProductRequestSchema } from '../schemas/productRequestSchema.js'
import { getProductsRequestSchema } from '../schemas/productsRequestSchema.js'
import { ProductService } from '../services/ProductService.js'
import { mapDetailLevel } from '../utils/detail-level.js'
import * as caching from '../../../common/hooks/cacheHooks.js'

import type { FastifyInstance } from 'fastify'
import type { GetProductRequestSchema } from '../schemas/productRequestSchema.js'
import type { GetProductsRequestSchema } from '../schemas/productsRequestSchema.js'
import type { InferFastifyRequest } from '../../../common/types/InferFastifyRequest.js'

export default async function (App: FastifyInstance) {
  App.addHook('onRequest', caching.setupCacheHook)
  App.addHook('preHandler', caching.readCacheHook)
  App.addHook('onResponse', caching.writeCacheHook)

  App.get('/:module/products', {
    preValidation: async function (request: InferFastifyRequest<GetProductsRequestSchema>) {
      getProductsRequestSchema.parse(request)
    },
    handler: async function (request: InferFastifyRequest<GetProductsRequestSchema>, reply) {
      const { params, query } = request
      const products = await ProductService.getProducts(
        params.module,
        request.query,
        mapDetailLevel(query.detailLevel)
      )
      request.data = products.map(product => product.display())

      reply.send(request.data)
    }
  })

  App.get('/:module/products/:id', {
    preValidation: async function (request: InferFastifyRequest<GetProductRequestSchema>) {
      getProductRequestSchema.parse(request)
    },
    handler: async function (request: InferFastifyRequest<GetProductRequestSchema>, reply) {
      const { module, id } = request.params
      const product = await ProductService.getProduct(module, id)
      request.data = product.display()

      reply.send(request.data)
    }
  })
}

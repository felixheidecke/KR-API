import { getProductRequestSchema } from '../schemas/productRequestSchema.js'
import { getProductsRequestSchema } from '../schemas/productsRequestSchema.js'
import { GroupService } from '../services/GroupService.js'
import { ProductService } from '../services/ProductService.js'
import { toSeconds } from '../../../common/utils/convert-time.js'
import caching from '../../../common/plugins/caching.js'

import type { FastifyInstance } from 'fastify'
import type { GetProductRequestSchema } from '../schemas/productRequestSchema.js'
import type { GetProductsRequestSchema } from '../schemas/productsRequestSchema.js'
import type { Group } from '../entities/Group.js'
import type { InferFastifyRequest } from '../../../common/types/InferFastifyRequest.js'
import type { Product } from '../entities/Product.js'

export default async function (App: FastifyInstance) {
  App.register(caching, {
    redisTTL: toSeconds({ minutes: 5 }),
    browserTTL: toSeconds({ minutes: 15 })
  })

  App.get('/:module/products', {
    preValidation: async function (request: InferFastifyRequest<GetProductsRequestSchema>) {
      const { params, query } = getProductsRequestSchema.parse(request)
      request.params = params
      request.query = query
    },
    handler: async function (request: InferFastifyRequest<GetProductsRequestSchema>, reply) {
      const { params, query } = request

      const products = await ProductService.getProducts(params.module, query, {
        shouldThrow: true
      })
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
      const product = await ProductService.getProduct(module, id, { shouldThrow: true })
      request.data = (product as Product).display()

      reply.send(request.data)
    }
  })

  App.get('/:module/products/:id/group', {
    preValidation: async function (request: InferFastifyRequest<GetProductRequestSchema>) {
      getProductRequestSchema.parse(request)
    },
    handler: async function (request: InferFastifyRequest<GetProductRequestSchema>, reply) {
      const { module, id } = request.params
      const group = await GroupService.getGroupByProductId(module, id, { shouldThrow: true })
      request.data = (group as Group).display()

      reply.send(request.data)
    }
  })
}

import { getProductRequestSchema, getProductsRequestSchema } from '../schemas/product-schema.js'
import { GroupService } from '../services/group-service.js'
import { ProductService } from '../services/product-service.js'
import { toSeconds } from '#utils/convert-time.js'
import caching from '#plugins/caching/index.js'

import type { FastifyInstance } from 'fastify'
import type { InferFastifyRequest } from '#libs/fastify.js'
import type { z } from 'zod'

type GetProductsRequestSchema = InferFastifyRequest<z.infer<typeof getProductsRequestSchema>>
type GetProductRequestSchema = InferFastifyRequest<z.infer<typeof getProductRequestSchema>>

export default async function ProductsController(App: FastifyInstance) {
  App.register(caching, {
    redisTTL: toSeconds({ minutes: 5 }),
    browserTTL: toSeconds({ minutes: 15 })
  })

  App.get('/:module/products', {
    preValidation: async function (request: GetProductsRequestSchema) {
      const { params, query } = getProductsRequestSchema.parse(request)

      request.params = params
      request.query = query
    },
    handler: async function (request, reply) {
      const { params, query } = request
      const products = await ProductService.getProductsByModule(params.module, query)

      request.data = products.map(product => product.display())

      reply.send(request.data)
    }
  })

  App.get('/:module/products/:id', {
    preValidation: async function (request: GetProductRequestSchema) {
      const { params } = getProductRequestSchema.parse(request)

      request.params = params
    },
    handler: async function (request, reply) {
      const { module, id } = request.params
      const product = await ProductService.getProductById(module, id)

      request.data = product.display()

      reply.send(request.data)
    }
  })

  App.get('/:module/products/:id/group', {
    preValidation: async function (request: GetProductRequestSchema) {
      const { params } = getProductRequestSchema.parse(request)

      request.params = params
    },
    handler: async function (request, reply) {
      const { module, id } = request.params
      const group = await GroupService.getGroupByProductId(module, id)

      request.data = group.display()

      reply.send(request.data)
    }
  })
}

import { Cart } from '../entities/cart.js'
import { CartService } from '../services/cart-service.js'
import { cacheControlNoStoreHandler } from '#utils/header-hooks.js'
import { getCartRequestSchema, updateCartRequestSchema } from '../schemas/cart-schema.js'

import type { FastifyInstance } from 'fastify'
import type { InferFastifyRequest } from '#libs/fastify.js'
import type { z } from 'zod'

type UpdateCartRequestSchema = InferFastifyRequest<z.infer<typeof updateCartRequestSchema>>
type GetCartRequestSchema = InferFastifyRequest<z.infer<typeof getCartRequestSchema>>

export default async function CartController(App: FastifyInstance) {
  App.addHook('onSend', cacheControlNoStoreHandler)

  App.addHook(
    'onRequest',
    async function ({ session, params }: UpdateCartRequestSchema | GetCartRequestSchema) {
      session.cart ??= new Cart(params.module)
    }
  )

  App.put('/:module/cart', {
    preValidation: async function (request: UpdateCartRequestSchema) {
      const { params, body } = updateCartRequestSchema.parse(request)

      request.params = params
      request.body = body
    },
    handler: async function ({ session, body }, reply) {
      await Promise.all([
        CartService.initialise(session.cart),
        CartService.updateProductQuantity(session.cart, body)
      ])

      reply.send(session.cart.display())
    }
  })

  App.get('/:module/cart', {
    preValidation: async function (request: GetCartRequestSchema) {
      const { params } = getCartRequestSchema.parse(request)

      request.params = params
    },
    handler: async function ({ session }, reply) {
      await CartService.initialise(session.cart)

      reply.send(session.cart.display())
    }
  })

  App.delete('/shop/:module/cart', {
    handler: async ({ session }, reply) => {
      session.destroy()
      reply.code(204).send()
    }
  })
}

import { Cart } from '../entities/cart.js'
import { CartService } from '../services/cart-service.js'
import { getCartRequestSchema } from '../schemas/get-cart-request-schema.js'
import { setNoStoreHeaders } from '#utils/header-hooks.js'
import { updateCartRequestSchema } from '../schemas/update-cart-request-schema.js'

import type { FastifyInstance } from 'fastify'
import type { InferFastifyRequest } from '#libs/fastify.js'
import type { GetCartRequestSchema } from '../schemas/get-cart-request-schema.js'
import type { UpdateCartRequestSchema } from '../schemas/update-cart-request-schema.js'

export default async function (App: FastifyInstance) {
  App.addHook('onSend', setNoStoreHeaders)

  App.addHook(
    'onRequest',
    async function ({ session, params }: InferFastifyRequest<UpdateCartRequestSchema>) {
      session.cart ??= new Cart(params.module)
    }
  )

  App.put('/:module/cart', {
    preValidation: async function (request: InferFastifyRequest<UpdateCartRequestSchema>) {
      const { params, body } = updateCartRequestSchema.parse(request)

      request.params = params
      request.body = body
    },
    handler: async function ({ session, body }, reply) {
      await Promise.all([
        CartService.initialise(session.cart, { shouldThrow: true }),
        CartService.updateProductQuantity(session.cart, body)
      ])

      reply.send(session.cart.display())
    }
  })

  App.get('/:module/cart', {
    preValidation: async function (request: InferFastifyRequest<GetCartRequestSchema>) {
      const { params } = getCartRequestSchema.parse(request)

      request.params = params
    },
    handler: async function ({ session }, reply) {
      await CartService.initialise(session.cart, { shouldThrow: true })

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

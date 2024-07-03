import { setNoStoreHeaders } from '../../../common/hooks/headerHooks.js'
import { Cart } from '../entities/Cart.js'
import { CartService } from '../services/CartService.js'
import { getCartRequestSchema } from '../schemas/getCartRequestSchema.js'
import { updateCartRequestSchema } from '../schemas/updateCartRequestSchema.js'

import type { FastifyInstance } from 'fastify'
import type { GetCartRequestSchema } from '../schemas/getCartRequestSchema.js'
import type { InferFastifyRequest } from '../../../common/types/InferFastifyRequest.js'
import type { UpdateCartRequestSchema } from '../schemas/updateCartRequestSchema.js'

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
      const cartService = new CartService(session.cart)

      await Promise.all([
        cartService.initialise({ shouldThrow: true }),
        cartService.updateProductQuantity(body)
      ])

      reply.send(cartService.cart.display())
    }
  })

  App.get('/:module/cart', {
    preValidation: async function (request: InferFastifyRequest<GetCartRequestSchema>) {
      getCartRequestSchema.parse(request)
    },
    handler: async function ({ session }, reply) {
      const cartService = new CartService(session.cart)

      await cartService.initialise({ shouldThrow: true })

      reply.send(cartService.cart.display())
    }
  })

  App.delete('/shop/:module/cart', {
    handler: async ({ session }, reply) => {
      session.destroy()
      reply.code(204).send()
    }
  })
}

import { cacheHeadersNoStoreHook } from '../../../common/hooks/headerHooks.js'
import { Cart } from '../entities/Cart.js'
import { CartService } from '../services/CartService.js'
import { getCartRequestSchema } from '../schemas/getCartRequestSchema.js'
import { updateCartRequestSchema } from '../schemas/updateCartRequestSchema.js'

import type { FastifyInstance } from 'fastify'
import type { GetCartRequestSchema } from '../schemas/getCartRequestSchema.js'
import type { InferFastifyRequest } from '../../../common/types/InferFastifyRequest.js'
import type { UpdateCartRequestSchema } from '../schemas/updateCartRequestSchema.js'

export default async function (App: FastifyInstance) {
  App.addHook('onSend', cacheHeadersNoStoreHook)

  App.put('/:module/cart', {
    preValidation: async function (request: InferFastifyRequest<UpdateCartRequestSchema>) {
      updateCartRequestSchema.parse(request)
    },
    handler: async function ({ session, params, body }, reply) {
      session.cart ??= new Cart(params.module)

      await CartService.updateProductQuantityById(session.cart, body)
      reply.send(session.cart.display())
    }
  })

  App.get('/:module/cart', {
    preValidation: async function (request: InferFastifyRequest<GetCartRequestSchema>) {
      getCartRequestSchema.parse(request)
    },
    handler: async function ({ session, params }, reply) {
      session.cart ??= await CartService.load(params.module)

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

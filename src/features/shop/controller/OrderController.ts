import { cacheHeadersNoStoreHook } from '../../../common/hooks/headerHooks.js'
import { getOrderRequestSchema } from '../schemas/getOrderRequestSchema.js'
import { HttpError } from '../../../common/decorators/Error.js'
import { Order } from '../entities/Order.js'
import { OrderService } from '../services/OrderService.js'
import { patchOrderRequestSchema } from '../schemas/patchOrderRequestSchema.js'
import { postOrderRequestSchema } from '../schemas/postOrderRequestSchema.js'

import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify'
import type { GetOrderRequestSchema } from '../schemas/getOrderRequestSchema.js'
import type { InferFastifyRequest } from '../../../common/types/InferFastifyRequest.js'
import type { PatchOrderRequestSchema } from '../schemas/patchOrderRequestSchema.js'
import type { PostOrderRequestSchema } from '../schemas/postOrderRequestSchema.js'

export default async function (App: FastifyInstance) {
  App.addHook('onSend', cacheHeadersNoStoreHook)

  App.patch('/:module/order', {
    preValidation: async function (request: InferFastifyRequest<PatchOrderRequestSchema>) {
      patchOrderRequestSchema.parse(request)
    },
    handler: async function ({ session, params, body }, reply) {
      session.order ??= new Order(params.module)

      if (body.address) {
        session.order.address = body.address as PatchOrderRequestSchema['body']['address']
      }

      if (body.deliveryAddress !== undefined) {
        session.order.deliveryAddress =
          body.deliveryAddress as PatchOrderRequestSchema['body']['deliveryAddress']
      }

      if (body.message !== undefined) {
        session.order.message = body.message as string
      }

      reply.send(session.order.display())
    }
  })

  App.post('/:module/order', {
    preValidation: async function (request: InferFastifyRequest<PostOrderRequestSchema>) {
      postOrderRequestSchema.parse(request)
    },
    handler: async function (
      { session, headers }: InferFastifyRequest<PostOrderRequestSchema>,
      reply
    ) {
      OrderService.importCart(session.order, session.cart)
      await OrderService.saveOrder(session.order)
      await OrderService.sendOrderConfirmationMail(session.order, headers.origin as string)
      reply.send({ transactionId: session.order.transactionId })
      session.destroy()
    }
  })

  App.get('/:module/order', {
    handler: async ({ session }: FastifyRequest, reply: FastifyReply) => {
      if (session.order) {
        reply.send(session.order.display())
      } else {
        throw new HttpError('No order in session.', 400)
      }
    }
  })

  App.get('/:module/order/:transactionId', {
    preValidation: async function (request: InferFastifyRequest<GetOrderRequestSchema>) {
      getOrderRequestSchema.parse(request)
    },

    handler: async (request: InferFastifyRequest<GetOrderRequestSchema>, reply: FastifyReply) => {
      const { module, transactionId } = request.params
      const order = await OrderService.getOrder(module, transactionId)

      reply.send(order.display())
    }
  })

  App.delete('/:module/order', {
    handler: async ({ session }, reply) => {
      session.destroy()
      reply.code(205).send()
    }
  })
}

import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify'
import {
  patchOrderRequestSchema,
  type PatchOrderRequestSchema
} from '../schemas/patch-order-request-schema.js'
import {
  postOrderRequestSchema,
  type PostOrderRequestSchema
} from '../schemas/post-order-request-schema.js'
import { OrderService } from '../services/order-service.js'
import {
  getOrderRequestSchema,
  type GetOrderRequestSchema
} from '../schemas/get-order-request-schema.js'
import { cacheControlNoStoreHandler } from '#utils/header-hooks.js'
import type { InferFastifyRequest } from '#libs/fastify.js'
import { HttpError } from '#utils/http-error.js'
import { Order } from '../entities/order.js'

export default async function (App: FastifyInstance) {
  App.addHook('onSend', cacheControlNoStoreHandler)

  App.get('/:module/order', {
    handler: async ({ session }: FastifyRequest, reply: FastifyReply) => {
      if (session.order) {
        reply.send(session.order.display())
      } else {
        throw HttpError.BAD_REQUEST('No order in session.')
      }
    }
  })

  App.patch('/:module/order', {
    preValidation: async function (request: InferFastifyRequest<PatchOrderRequestSchema>) {
      const { body, params } = patchOrderRequestSchema.parse(request)

      request.body = body
      request.params = params
    },
    handler: async function ({ session, params, body }, reply) {
      session.order ??= new Order(params.module)

      if ('address' in body) {
        session.order.address = body.address as PatchOrderRequestSchema['body']['address'] | null
      }

      if ('deliveryAddress' in body) {
        session.order.deliveryAddress = body.deliveryAddress as
          | PatchOrderRequestSchema['body']['deliveryAddress']
          | null
      }

      if ('message' in body) {
        session.order.message = body.message?.trim() || ''
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
      reply.send({
        transactionId: session.order.transactionId
      })
      session.destroy()
    }
  })

  App.get('/:module/order/:transactionId', {
    preValidation: async function (request: InferFastifyRequest<GetOrderRequestSchema>) {
      getOrderRequestSchema.parse(request)
    },
    handler: async (request: InferFastifyRequest<GetOrderRequestSchema>, reply: FastifyReply) => {
      const { module, transactionId } = request.params
      const order = await OrderService.getOrder(module, transactionId, { shouldThrow: true })

      reply.send((order as Order).display())
    }
  })

  App.delete('/:module/order', {
    handler: async ({ session }, reply) => {
      session.destroy()
      reply.code(205).send()
    }
  })
}

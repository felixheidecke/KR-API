import { OrderService } from '../services/order-service.js'
import { cacheControlNoStoreHandler } from '#utils/header-hooks.js'
import { Order } from '../entities/order.js'
import {
  getOrderRequestSchema,
  patchOrderRequestSchema,
  postOrderRequestSchema
} from '../schemas/order-request-schema.js'
import type { InferFastifyRequest } from '#libs/fastify.js'
import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify'
import type { z } from 'zod'

type PatchOrderRequestSchema = InferFastifyRequest<z.infer<typeof patchOrderRequestSchema>>
type PostOrderRequestSchema = InferFastifyRequest<z.infer<typeof postOrderRequestSchema>>
type GetOrderRequestSchema = InferFastifyRequest<z.infer<typeof getOrderRequestSchema>>

export default async function OrderController(App: FastifyInstance) {
  App.addHook('onSend', cacheControlNoStoreHandler)

  App.get('/:module/order', {
    handler: async ({ session }: FastifyRequest, reply: FastifyReply) => {
      if (session.order) {
        reply.send(session.order.display())
      } else {
        reply.code(204).send()
      }
    }
  })

  App.patch('/:module/order', {
    preValidation: async function (request: PatchOrderRequestSchema) {
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
    preValidation: async function (request: PostOrderRequestSchema) {
      const { headers, params } = postOrderRequestSchema.parse(request)

      request.headers = headers
      request.params = params
    },
    handler: async function ({ session, headers }, reply) {
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
    preValidation: async function (request: GetOrderRequestSchema) {
      getOrderRequestSchema.parse(request)
    },
    handler: async (request, reply: FastifyReply) => {
      const { module, transactionId } = request.params
      const order = await OrderService.getOrderByTransaction(module, transactionId)

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

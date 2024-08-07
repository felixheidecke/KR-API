import { cacheControlNoStoreHandler } from '#utils/header-hooks.js'
import { HttpError } from '#utils/http-error.js'
import { OrderService } from '../services/order-service.js'
import { PayPal } from '../entities/paypal.js'
import { PayPalService } from '../services/paypal-service.js'

import type { FastifyInstance } from 'fastify'
import type { InferFastifyRequest } from '#libs/fastify.js'
import type { z } from 'zod'
import { capturePayPalRequestSchema, createPayPalRequestSchema } from '../schemas/paypal-schema.js'

type CreatePayPalRequestSchema = InferFastifyRequest<z.infer<typeof createPayPalRequestSchema>>
type CapturePayPalRequestSchema = InferFastifyRequest<z.infer<typeof capturePayPalRequestSchema>>

export default async function PaymentController(App: FastifyInstance) {
  App.addHook('onSend', cacheControlNoStoreHandler)

  App.post('/:module/payment/paypal/create', {
    preValidation: async (request: CreatePayPalRequestSchema) => {
      createPayPalRequestSchema.parse(request)
    },
    handler: async (request, reply) => {
      const { params, body, session } = request

      session.paypal ??= new PayPal(params.module)
      session.order = await OrderService.getOrderByTransaction(params.module, body.transactionId)

      if (!session.order) {
        throw HttpError.BAD_REQUEST('No order in session')
      }

      if (session.order.paymentType === 'paypal') {
        throw HttpError.CONFLICT('Order has already been processed')
      }

      await PayPalService.createOrder(session.paypal, session.order.total)
      reply.code(201).send({ orderId: session.paypal.orderId })
    }
  })

  App.post('/:module/payment/paypal/capture', {
    preValidation: async (request: CapturePayPalRequestSchema) => {
      capturePayPalRequestSchema.parse(request)
    },
    handler: async ({ session }, reply) => {
      await PayPalService.captureOrder(session.paypal)
      await OrderService.updatePaymentStatus(session.order, 'paypal')

      reply.send(session.order.display())
      session.destroy()
    }
  })
}

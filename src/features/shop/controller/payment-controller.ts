import { setNoStoreHeaders } from '#utils/header-hooks.js'

import type { FastifyInstance } from 'fastify'
import type { InferFastifyRequest } from '#libs/fastify.js'
import {
  createPayPalRequestSchema,
  type CreatePayPalRequestSchema
} from '../schemas/create-paypal-request-schema.js'
import { PayPal } from '../entities/paypal.js'
import { OrderService } from '../services/order-service.js'
import { HttpError } from '#utils/http-error.js'
import { PayPalService } from '../services/paypal-service.js'
import {
  capturePayPalRequestSchema,
  type CapturePayPalRequestSchema
} from '../schemas/capture-paypal-request-schema.js'

export default async function (App: FastifyInstance) {
  App.addHook('onSend', setNoStoreHeaders)

  App.post('/:module/payment/paypal/create', {
    preValidation: async (request: InferFastifyRequest<CreatePayPalRequestSchema>) => {
      createPayPalRequestSchema.parse(request)
    },
    handler: async (request: InferFastifyRequest<CreatePayPalRequestSchema>, reply) => {
      const { params, body, session } = request
      session.paypal ??= new PayPal(params.module)
      session.order = await OrderService.getOrder(params.module, body.transactionId)

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
    preValidation: async (request: InferFastifyRequest<CapturePayPalRequestSchema>) => {
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

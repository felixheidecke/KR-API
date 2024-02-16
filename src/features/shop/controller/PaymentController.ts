import { cacheHeadersNoStoreHook } from '../../../common/hooks/headerHooks.js'
import { capturePayPalRequestSchema } from '../schemas/capturePayPalRequestSchema.js'
import { createPayPalRequestSchema } from '../schemas/createPayPalRequestSchema.js'
import { HttpError } from '../../../common/decorators/Error.js'
import { OrderService } from '../services/OrderService.js'
import { PayPal } from '../entities/PayPal.js'
import { PayPalInteractor } from '../services/PayPalService.js'

import type { CapturePayPalRequestSchema } from '../schemas/capturePayPalRequestSchema.js'
import type { CreatePayPalRequestSchema } from '../schemas/createPayPalRequestSchema.js'
import type { FastifyInstance } from 'fastify'
import type { InferFastifyRequest } from '../../../common/types/InferFastifyRequest.js'

export default async function (App: FastifyInstance) {
  App.addHook('onRequest', cacheHeadersNoStoreHook)

  App.post('/:module/payment/paypal/create', {
    preValidation: async (request: InferFastifyRequest<CreatePayPalRequestSchema>) => {
      createPayPalRequestSchema.parse(request)
    },
    handler: async (request: InferFastifyRequest<CreatePayPalRequestSchema>, reply) => {
      const { params, body, session } = request
      session.paypal ??= new PayPal(params.module)
      session.order = await OrderService.getOrder(params.module, body.transactionId)

      if (session.order.paymentType === 'paypal') {
        throw new HttpError('Order has already been processed', 400)
      }

      await PayPalInteractor.createOrder(session.paypal, session.order.total)
      reply.code(201).send({ orderId: session.paypal.orderId })
    }
  })

  App.post('/:module/payment/paypal/capture', {
    preValidation: async (request: InferFastifyRequest<CapturePayPalRequestSchema>) => {
      capturePayPalRequestSchema.parse(request)
    },
    handler: async ({ session }, reply) => {
      await PayPalInteractor.captureOrder(session.paypal)
      await OrderService.updatePaymentStatus(session.order, 'paypal')
      reply.send(session.order.display())
      session.destroy()
    }
  })
}

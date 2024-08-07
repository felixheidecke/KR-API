import { z } from 'zod'
import type { PayPal } from '../entities/paypal.js'
import type { Order } from '../entities/order.js'

export const capturePayPalRequestSchema = z
  .object({
    params: z.object({
      module: z.coerce.number().gt(0)
    }),
    session: z.object({
      paypal: z.object(
        {
          module: z.coerce.number(),
          orderId: z.string().length(17)
        },
        { required_error: 'Missing PayPal instance.' }
      ),
      order: z.object(
        {
          module: z.coerce.number(),
          transactionId: z.string()
        },
        { required_error: 'Missing Order instance.' }
      )
    })
  })
  .refine(
    ({ params, session }) => {
      return (
        params.module === (session.order as Order).module &&
        params.module === (session.paypal as PayPal).module
      )
    },
    {
      message: 'Module mismatch'
    }
  )

export const createPayPalRequestSchema = z.object({
  params: z.object({
    module: z.coerce.number().gt(0)
  }),
  body: z.object({
    transactionId: z.string().length(8)
  })
})

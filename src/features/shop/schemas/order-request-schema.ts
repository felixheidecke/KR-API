import { z } from 'zod'
import { addressSchema } from './address-schema.js'
import { deliveryAddressSchema } from './delivery-address-schema.js'
import detectHTML from '../utils/detect-html.js'

export const getOrderRequestSchema = z.object({
  params: z.object({
    module: z.coerce.number().gt(0),
    transactionId: z.string().min(8).max(16)
  })
})

export type GetOrderRequestSchema = z.infer<typeof getOrderRequestSchema>

export const patchOrderRequestSchema = z.object({
  params: z.object({
    module: z.coerce.number().gt(0)
  }),
  body: z.object({
    address: addressSchema.nullish(),
    deliveryAddress: deliveryAddressSchema.nullish(),
    message: z.string().refine(detectHTML, { message: 'Kein HTML erlaubt' }).nullish()
  })
})

export type PatchOrderRequestSchema = z.infer<typeof patchOrderRequestSchema>

export const postOrderRequestSchema = z.object({
  params: z.object({
    module: z.coerce.number().gt(0)
  }),
  headers: z.object({
    origin: z.string().startsWith('http')
  }),
  session: z.object({
    cart: z.object(
      {
        isEmpty: z.coerce.boolean().refine(val => val === false, {
          message: 'Der Warenkorb ist leer'
        })
      },
      {
        required_error: 'Kein Warenkorb vorhanden'
      }
    ),
    order: z.object(
      {
        hasAddress: z.coerce.boolean().refine(val => val === true, {
          message: 'Adresse fehlt'
        })
      },
      {
        required_error: 'Kein aktiver Bestellvorgang'
      }
    )
  })
})

export type PostOrderRequestSchema = z.infer<typeof postOrderRequestSchema>

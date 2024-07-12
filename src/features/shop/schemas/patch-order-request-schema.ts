import { z } from 'zod'
import { addressSchema } from './address-schema.js'
import { deliveryAddressSchema } from './delivery-address-schema.js'

export const patchOrderRequestSchema = z.object({
  params: z.object({
    module: z.coerce.number().gt(0)
  }),
  body: z.object({
    address: addressSchema.nullish(),
    deliveryAddress: deliveryAddressSchema.nullish(),
    message: z.string().nullish()
  })
})

export type PatchOrderRequestSchema = z.infer<typeof patchOrderRequestSchema>

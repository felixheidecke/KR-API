import { z } from 'zod'
import { addressSchema } from './addressSchema.js'
import { deliveryAddressSchema } from './deliveryAddressSchema.js'

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

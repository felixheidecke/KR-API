import { z } from 'zod'

export const deliveryAddressSchema = z.object({
  company: z.string().optional(),
  name: z
    .string({ required_error: 'Empfängername fehlt' })
    .min(5, { message: 'Empfängername zu kurz.' }),
  address: z
    .string({ required_error: 'Empfängeradresse fehlt.' })
    .min(5, { message: 'Empfängeradresse zu kurz.' }),
  zip: z
    .string({ required_error: 'Postleitzahl fehlt.' })
    .length(5, { message: 'Postleitzahl muss aus 5 Zeichen bestehen.' }),
  city: z.string({ required_error: 'Stadtname fehlt' }).min(3, { message: 'Stadtname zu Kurz' }),
  phone: z.string().optional()
})

export type DeliveryAddressSchema = z.infer<typeof deliveryAddressSchema>

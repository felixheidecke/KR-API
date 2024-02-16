import { z } from 'zod'

export const createPayPalRequestSchema = z.object({
  params: z.object({
    module: z.coerce.number().gt(0)
  }),
  body: z.object({
    transactionId: z.string().length(8)
  })
})

export type CreatePayPalRequestSchema = z.infer<typeof createPayPalRequestSchema>

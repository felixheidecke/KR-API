import { z } from 'zod'

export const getOrderRequestSchema = z.object({
  params: z.object({
    module: z.coerce.number().gt(0),
    transactionId: z.string().min(8).max(16)
  })
})

export type GetOrderRequestSchema = z.infer<typeof getOrderRequestSchema>

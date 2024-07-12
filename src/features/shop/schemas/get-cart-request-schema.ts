import { z } from 'zod'

export const getCartRequestSchema = z.object({
  params: z.object({
    module: z.coerce.number().gt(0)
  })
})

export type GetCartRequestSchema = z.infer<typeof getCartRequestSchema>

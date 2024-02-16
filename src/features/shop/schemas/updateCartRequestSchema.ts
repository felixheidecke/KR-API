import { z } from 'zod'

export const updateCartRequestSchema = z.object({
  params: z.object({
    module: z.coerce.number().gt(0)
  }),
  body: z.array(
    z.object({
      productId: z.number().gt(0),
      quantity: z.number().gte(0)
    })
  )
})

export type UpdateCartRequestSchema = z.infer<typeof updateCartRequestSchema>

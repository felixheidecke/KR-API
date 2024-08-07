import { z } from 'zod'

export const updateCartRequestSchema = z.object({
  params: z.object({
    module: z.coerce.number().gt(0)
  }),
  body: z.array(
    z.object({
      productId: z
        .number({ required_error: 'Product ID is required.' })
        .gt(0, { message: 'Product ID must be greater than 0.' }),
      quantity: z
        .number({ required_error: 'Product quantity is required.' })
        .gte(0, { message: 'Quantity must be greater than or equal to 0.' })
    })
  )
})

export const getCartRequestSchema = z.object({
  params: z.object({
    module: z.coerce.number().gt(0)
  })
})

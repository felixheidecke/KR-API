import { z } from 'zod'

export const getProductRequestSchema = z.object({
  params: z.object({
    module: z.coerce.number().gt(0),
    id: z.coerce.number().gt(0)
  })
})

export const getProductsRequestSchema = z.object({
  params: z.object({
    module: z.coerce.number().gt(0)
  }),
  query: z.object({
    limit: z.coerce.number().gt(0).optional(),
    frontpage: z
      .string()
      .transform(frontpage => frontpage === 'true')
      .optional()
  })
})

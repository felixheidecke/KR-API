import { z } from 'zod'

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

export type GetProductsRequestSchema = z.infer<typeof getProductsRequestSchema>

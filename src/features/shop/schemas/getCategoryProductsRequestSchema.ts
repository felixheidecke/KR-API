import { z } from 'zod'

export const getCategoryProductsRequestSchema = z.object({
  query: z.object({
    detailLevel: z.enum(['minimal', 'basic']).optional(),
    limit: z.coerce.number().gt(0).optional()
  }),
  params: z.object({
    module: z.coerce.number().gt(0),
    id: z.coerce.number().gt(0)
  })
})

export type GetCategoryProductsRequestSchema = z.infer<typeof getCategoryProductsRequestSchema>

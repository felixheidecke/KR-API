import { z } from 'zod'

export const getCategoryProductsRequestSchema = z.object({
  query: z.object({
    limit: z.coerce.number().gt(0).optional(),
    recursive: z.coerce.boolean().optional().default(false)
  }),
  params: z.object({
    module: z.coerce.number().gt(0),
    id: z.coerce.number().gt(0)
  })
})

export type GetCategoryProductsRequestSchema = z.infer<typeof getCategoryProductsRequestSchema>

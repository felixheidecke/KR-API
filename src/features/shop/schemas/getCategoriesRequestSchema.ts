import { z } from 'zod'

export const getCategoriesRequestSchema = z.object({
  params: z.object({
    module: z.coerce.number().gt(0)
  }),
  query: z.object({
    detailLevel: z.enum(['minimal', 'basic', 'extended']).optional()
  })
})

export type GetCategoriesRequestSchema = z.infer<typeof getCategoriesRequestSchema>

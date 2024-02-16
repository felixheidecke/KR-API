import { z } from 'zod'
import { mapDetailLevel } from '../../shop/utils/detail-level.js'

export const getArticlesRequestSchema = z.object({
  params: z.object({
    module: z.coerce.number().gt(0)
  }),
  query: z.object({
    status: z.enum(['archived']).optional(),
    limit: z.coerce.number().gt(0).optional(),
    detailLevel: z
      .enum(['minimal', 'extended', 'full'])
      .optional()
      .transform(level => mapDetailLevel(level))
  })
})

export type GetArticlesRequestSchema = z.infer<typeof getArticlesRequestSchema>

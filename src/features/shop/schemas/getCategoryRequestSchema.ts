import { z } from 'zod'
import { mapDetailLevel } from '../utils/detail-level.js'

export const getCategoryRequestSchema = z.object({
  params: z.object({
    module: z.coerce.number().int(),
    id: z.coerce.number().int()
  }),
  query: z.object({
    detailLevel: z
      .enum(['extended', 'full'])
      .optional()
      .transform(level => mapDetailLevel(level))
  })
})

export type GetCategoryRequestSchema = z.infer<typeof getCategoryRequestSchema>

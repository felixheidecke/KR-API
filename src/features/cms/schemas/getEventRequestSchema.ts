import { z } from 'zod'
import { mapDetailLevel } from '../../shop/utils/detail-level.js'

export const getEventRequestSchema = z.object({
  params: z.object({
    module: z.coerce.number().gt(0),
    id: z.coerce.number().gt(0)
  }),
  query: z.object({
    detailLevel: z
      .enum(['minimal', 'basic'])
      .optional()
      .transform(level => mapDetailLevel(level))
  })
})

export type GetEventRequestSchema = z.infer<typeof getEventRequestSchema>

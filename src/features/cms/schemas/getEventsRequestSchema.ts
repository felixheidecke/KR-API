import { z } from 'zod'
import { mapDetailLevel } from '../../shop/utils/detail-level.js'

export const getEventsRequestSchema = z.object({
  params: z.object({
    module: z.coerce.number().gt(0)
  }),
  query: z.object({
    startsBefore: z.coerce.date().optional(),
    startsAfter: z.coerce.date().optional(),
    endsBefore: z.coerce.date().optional(),
    endsAfter: z.coerce.date().optional(),
    limit: z.coerce.number().gt(0).optional(),
    detailLevel: z
      .enum(['minimal', 'default', 'extended'])
      .optional()
      .transform(level => mapDetailLevel(level))
  })
})

export type GetEventsRequestSchema = z.infer<typeof getEventsRequestSchema>

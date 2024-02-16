import { z } from 'zod'
import { mapDetailLevel } from '../utils/detail-level.js'

export const getGroupsRequestSchema = z.object({
  params: z.object({
    module: z.coerce.number().gt(0)
  }),
  query: z.object({
    detailLevel: z
      .enum(['minimal', 'default', 'extended'])
      .optional()
      .transform(level => mapDetailLevel(level))
  })
})

export type GetGroupsRequestSchema = z.infer<typeof getGroupsRequestSchema>

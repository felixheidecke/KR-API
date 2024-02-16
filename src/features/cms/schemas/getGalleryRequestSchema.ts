import { get } from 'http'
import { z } from 'zod'
import { mapDetailLevel } from '../../shop/utils/detail-level.js'

export const getGalleryRequestSchema = z.object({
  params: z.object({
    module: z.coerce.number().gt(0)
  }),
  query: z.object({
    detailLevel: z
      .enum(['minimal'])
      .optional()
      .transform(level => mapDetailLevel(level))
  })
})

export type GetGalleryRequestSchema = z.infer<typeof getGalleryRequestSchema>

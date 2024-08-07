import { z } from 'zod'

export const getGalleryRequestSchema = z.object({
  params: z.object({
    module: z.coerce.number().gt(0)
  })
})

import { z } from 'zod'

export const getAlbumRequestSchema = z.object({
  params: z.object({
    module: z.coerce.number().gt(0),
    id: z.coerce.number().gt(0)
  })
})

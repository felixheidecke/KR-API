import { z } from 'zod'

export const getInfoRequestSchema = z.object({
  params: z.object({
    module: z.coerce.number().gt(0)
  })
})

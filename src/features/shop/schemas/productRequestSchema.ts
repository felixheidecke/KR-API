import { z } from 'zod'

export const getProductRequestSchema = z.object({
  params: z.object({
    module: z.coerce.number().gt(0),
    id: z.coerce.number().gt(0)
  })
})

export type GetProductRequestSchema = z.infer<typeof getProductRequestSchema>

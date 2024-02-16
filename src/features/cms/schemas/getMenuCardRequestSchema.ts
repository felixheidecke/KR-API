import { z } from 'zod'

export const getMenuCardRequestSchema = z.object({
  params: z.object({
    module: z.coerce.number().gt(0)
  })
})

export type GetMenuCardRequestSchema = z.infer<typeof getMenuCardRequestSchema>

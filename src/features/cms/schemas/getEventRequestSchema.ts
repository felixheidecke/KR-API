import { z } from 'zod'

export const getEventRequestSchema = z.object({
  params: z.object({
    module: z.coerce.number().gt(0),
    id: z.coerce.number().gt(0)
  })
})

export type GetEventRequestSchema = z.infer<typeof getEventRequestSchema>

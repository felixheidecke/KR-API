import { z } from 'zod'

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
    parts: z
      .string()
      .transform(parts => parts.split(','))
      .optional()
  })
})

export type GetEventsRequestSchema = z.infer<typeof getEventsRequestSchema>

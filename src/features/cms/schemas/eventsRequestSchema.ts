import { z } from 'zod'

const stringToArraySchema = z
  .string()
  .transform(parts => parts.split(','))
  .optional()

const querySchema = z.object({
  startsBefore: z.coerce.date().optional(),
  startsAfter: z.coerce.date().optional(),
  endsBefore: z.coerce.date().optional(),
  endsAfter: z.coerce.date().optional(),
  limit: z.coerce.number().gt(0).optional(),
  parts: stringToArraySchema
})

export const getEventsRequestSchema = z.object({
  params: z.object({
    module: z.coerce.number().gt(0)
  }),
  query: querySchema.optional()
})

export type GetEventsRequestSchema = z.infer<typeof getEventsRequestSchema>

export const getEventsQueryRequestSchema = z.object({
  query: querySchema
    .extend({
      modules: z
        .string()
        .transform(parts => parts.split(',').map(Number))
        .optional(),
      communes: stringToArraySchema
    })
    .refine(data => data.modules || data.communes, {
      message: 'At least one of modules or communes must be provided',
      path: ['modules', 'communes']
    })
})

export type GetEventsQueryRequestSchema = z.infer<typeof getEventsQueryRequestSchema>

export const getEventRequestSchema = z.object({
  params: z.object({
    module: z.coerce.number().gt(0),
    id: z.coerce.number().gt(0)
  })
})

export type GetEventRequestSchema = z.infer<typeof getEventRequestSchema>

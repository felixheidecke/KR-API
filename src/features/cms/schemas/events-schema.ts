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
  offset: z.coerce
    .number()
    .gte(0, { message: 'Offset must be greater than or equal to 0' })
    .optional()
    .default(0),
  parts: stringToArraySchema
})

export const getEventsRequestSchema = z.object({
  params: z.object({
    module: z.coerce.number().gt(0)
  }),
  query: querySchema.optional()
})

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

export const getEventRequestSchema = z.object({
  params: z.object({
    module: z.coerce.number().gt(0),
    id: z.coerce.number().gt(0)
  })
})

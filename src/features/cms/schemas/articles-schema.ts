import { z } from 'zod'

export const getArticleRequestSchema = z.object({
  params: z.object({
    module: z.coerce.number().gt(0),
    id: z.coerce.number().gt(0)
  })
})

export const getArticlesRequestSchema = z.object({
  params: z.object({
    module: z.coerce.number().gt(0)
  }),
  query: z
    .object({
      createdBefore: z.coerce.date().optional(),
      createdAfter: z.coerce.date().optional(),
      archived: z.coerce.boolean().optional().default(false),
      limit: z.coerce.number().gt(0).optional(),
      offset: z.coerce
        .number()
        .gte(0, { message: 'Offset must be greater than or equal to 0' })
        .optional()
        .default(0),
      parts: z
        .string()
        .optional()
        .transform(parts => parts?.split(','))
    })
    .refine(
      query => {
        return !(query.offset && !query.limit)
      },
      { message: 'Limit must be provided when using offset.' }
    )
})

export const countArticlesRequestSchema = z.object({
  params: z.object({
    module: z.coerce.number().gt(0)
  }),
  query: z.object({
    createdBefore: z.coerce.date().optional(),
    createdAfter: z.coerce.date().optional(),
    archived: z.coerce.boolean().optional().default(false)
  })
})

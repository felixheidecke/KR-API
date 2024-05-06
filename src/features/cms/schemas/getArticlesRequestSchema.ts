import { z } from 'zod'

export const getArticlesRequestSchema = z.object({
  params: z.object({
    module: z.coerce.number().gt(0)
  }),
  query: z.object({
    archived: z.coerce.boolean().optional().default(false),
    limit: z.coerce.number().gt(0).optional(),
    parts: z
      .string()
      .optional()
      .transform(parts => parts?.split(','))
  })
})

export type GetArticlesRequestSchema = z.infer<typeof getArticlesRequestSchema>

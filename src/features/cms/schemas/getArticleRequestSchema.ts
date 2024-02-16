import { z } from 'zod'

export const getArticleRequestSchema = z.object({
  params: z.object({
    module: z.coerce.number().gt(0),
    id: z.coerce.number().gt(0)
  })
})

export type GetArticleRequestSchema = z.infer<typeof getArticleRequestSchema>

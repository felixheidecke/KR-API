import { z } from 'zod'

export const getProductsRequestSchema = z.object({
  params: z.object({
    module: z.coerce.number().gt(0)
  }),
  query: z.object({
    detailLevel: z.enum(['minimal', 'basic']).optional(),
    limit: z.coerce.number().gt(0).optional(),
    highlights: z
      .string()
      .transform((val: string) => val === 'true')
      .optional()
  })
})

export type GetProductsRequestSchema = z.infer<typeof getProductsRequestSchema>

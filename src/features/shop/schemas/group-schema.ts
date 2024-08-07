import { z } from 'zod'

export const getGroupsRequestSchema = z.object({
  params: z.object({
    module: z.coerce.number().gt(0)
  })
})

export const getGroupProductsRequestSchema = z.object({
  query: z.object({
    limit: z.coerce.number().gt(0).optional(),
    recursive: z.coerce.boolean().optional().default(false)
  }),
  params: z.object({
    module: z.coerce.number().gt(0),
    id: z.coerce.number().gt(0)
  })
})

export const getGroupRequestSchema = z.object({
  params: z.object({
    module: z.coerce.number().int(),
    id: z.coerce.number().int()
  })
})

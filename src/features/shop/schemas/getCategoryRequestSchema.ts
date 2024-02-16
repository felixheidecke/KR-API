import { z } from 'zod'

export const getCategoryRequestSchema = z.object({
  params: z.object({
    module: z.coerce.number().int(),
    id: z.coerce.number().int()
  })
})

export type GetCategoryRequestSchema = z.infer<typeof getCategoryRequestSchema>

import { z } from 'zod'

export const getGroupsRequestSchema = z.object({
  params: z.object({
    module: z.coerce.number().gt(0)
  })
})

export type GetGroupsRequestSchema = z.infer<typeof getGroupsRequestSchema>

import { z } from 'zod'

export const formMailSchema = z.object({
  body: z
    .object({
      config: z
        .object({
          to: z.string().regex(/^[0-9,]+$/i, 'Ungültige(r) Empfänger'),
          required: z.string().optional(),
          subject: z.string({ required_error: 'Betreff fehlt' })
        })
        .required(),
      body: z.record(z.string())
    })
    .superRefine(({ config, body }, ctx) => {
      const requiredKeys = config.required?.split(',') || []
      const keys = Object.keys(body)
      const missing = requiredKeys.filter(key => !keys.includes(key)) || []

      if (config.required.length === 0) return

      missing.forEach(key => {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `${key} fehlt.`,
          path: ['body']
        })
      })
    }),
  query: z.object({
    attachBodyAsCSV: z.coerce.boolean().optional().default(false)
  })
})

export type FormMailSchema = z.infer<typeof formMailSchema>

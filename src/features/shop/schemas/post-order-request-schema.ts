import { z } from 'zod'

export const postOrderRequestSchema = z.object({
  params: z.object({
    module: z.coerce.number().gt(0)
  }),
  headers: z.object({
    origin: z.string().startsWith('http')
  }),
  session: z.object({
    cart: z.object(
      {
        isEmpty: z.coerce.boolean().refine(val => val === false, {
          message: 'Der Warenkorb ist leer'
        })
      },
      {
        required_error: 'Kein Warenkorb vorhanden'
      }
    ),
    order: z.object(
      {
        hasAddress: z.coerce.boolean().refine(val => val === true, {
          message: 'Adresse fehlt'
        })
      },
      {
        required_error: 'Kein aktiver Bestellvorgang'
      }
    )
  })
})

export type PostOrderRequestSchema = z.infer<typeof postOrderRequestSchema>

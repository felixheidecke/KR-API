import { z } from 'zod'

export const addressSchema = z.object({
  company: z.string().optional().refine(detectHTML, { message: 'Kein HTML erlaubt' }),
  salutation: z.enum(['Herr', 'Frau']),
  name: z.string().min(2, { message: 'Der Nachname muss mindestens 2 Buchstaben lang sein' }),
  firstname: z.string().min(2),
  address: z.string().min(5),
  zip: z.string({ required_error: 'PLZ fehlt' }).regex(/^[0-9]{5}$/, { message: 'PLZ zu kurz' }),
  city: z.string({ required_error: 'Stadt fehlt' }),
  phone: z.string({ required_error: 'Telefonnummer fehlt' }).regex(/^([\d\s]{6,})$/, {
    message: 'Telefonnummer darf nur Zahlen und Leerzeichen beinhalten'
  }),
  email: z
    .string({ required_error: 'Mail Adresse fehlt' })
    .email('Mail Adresse ungültig')
    .toLowerCase()
})

export type AddressSchema = z.infer<typeof addressSchema>

// Helper

function detectHTML(value: any) {
  return !/<[^>]*>/.test(value)
}

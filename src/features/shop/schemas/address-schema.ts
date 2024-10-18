import { z } from 'zod'
import detectHTML from '../utils/detect-html.js'

export const addressSchema = z.object(
  {
    company: z.string().optional().refine(detectHTML, { message: 'Kein HTML erlaubt' }),
    salutation: z.enum(['Herr', 'Frau']),
    name: z
      .string({ required_error: 'Nachname fehlt' })
      .min(2, { message: 'Der Nachname muss mindestens 2 Buchstaben lang sein' }),
    firstname: z
      .string({ required_error: 'Vorname fehlt' })
      .min(2, { message: 'Der Nachname muss mindestens 2 Buchstaben lang sein' }),
    address: z
      .string({ required_error: 'Adresse fehlt' })
      .min(5, { message: 'Die Adresse muss mindestens 2 Buchstaben lang sein' }),
    zip: z.string({ required_error: 'PLZ fehlt' }).regex(/^[0-9]{5}$/, { message: 'PLZ zu kurz' }),
    city: z.string({ required_error: 'Stadt fehlt' }),
    phone: z
      .string()
      .min(5, { message: 'Die Telefonnummer ist zu kurz' })
      .max(15, { message: 'Die Telefonnummer ist zu lang' })
      .regex(/^([\d\s]+)$/, {
        message: 'Telefonnummer darf nur Zahlen und Leerzeichen beinhalten'
      })
      .optional(),
    email: z
      .string({ required_error: 'Mail Adresse fehlt' })
      .email('Mail Adresse ungültig')
      .toLowerCase()
  },
  { required_error: 'Adresse fehlt' }
)

export type AddressSchema = z.infer<typeof addressSchema>

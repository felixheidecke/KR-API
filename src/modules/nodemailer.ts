// @ts-ignore
import nodemailer from 'nodemailer'

export default function useMailer(config = {}) {
  return nodemailer.createTransport({
    host: process.env.MAILER_HOST || 'localhost',
    port: process.env.MAILER_PORT || 25,
    requireTLS: process.env.MAILER_USE_TLS === 'true' || false,
    auth: {
      user: process.env.MAILER_USER,
      pass: process.env.MAILER_PASSWORD
    },
    ...config
  })
}

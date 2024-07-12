import type { Mail } from '#common/entities/mail.js'
import nodemailer from '#libs/nodemailer.js'

type SendReply = {
  accepted: Mail.Address[]
  rejected: Mail.Address[]
  ehlo: string[]
  envelopeTime: number
  messageTime: number
  messageSize: number
  response: string
  envelope: {
    from: Mail.Address
    to: Mail.Address[]
  }
  messageId: string
}

export namespace SendMailerApi {}

export class SendMailerApi {
  static async send(mail: Mail): Promise<SendReply> {
    return await nodemailer.sendMail({
      from: mail.from || process.env.MAILER_FROM,
      replyTo: mail.replyTo,
      cc: mail.cc,
      bcc: mail.bcc,
      to: mail.to,
      subject: mail.subject,
      text: mail.body,
      attachments: mail.attachments
    })
  }
}

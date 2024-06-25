import type { Mail } from '../entities/Mail.js'
import useMailer from '../../modules/nodemailer.js'

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
    const mailer = useMailer()

    return await mailer.sendMail({
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

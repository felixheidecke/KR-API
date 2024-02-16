import type { Mail } from '../entities/Mail.js'
import useMailer from '../../modules/nodemailer.js'

export class MailApi {
  static async send(mail: Mail) {
    const mailer = useMailer()

    return await mailer.sendMail({
      from: mail.from || process.env.MAILER_FROM,
      replyTo: mail.replyTo,
      cc: mail.cc,
      bcc: mail.bcc,
      to: mail.to,
      subject: mail.subject,
      text: mail.body
    })
  }
}

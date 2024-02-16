import { FormMail } from '../entities/FormMail.js'
import { MailApi } from '../../../common/gateways/MailApi.js'
import { MailRepo } from '../../../common/gateways/MailRepo.js'
import { HttpError } from '../../../common/decorators/Error.js'

export class FormMailService {
  public static async send(
    recipientId: Array<number | string>,
    subject: string,
    body: Record<string, string | number>
  ) {
    const recipients = await MailRepo.readMailAddresses(recipientId)
    const mail = new FormMail()

    if (!recipients.length) {
      throw HttpError.BAD_REQUEST('Recipient not found.')
    }

    if (body['email'] || body['Email']) {
      mail.replyTo = (body['email'] || body['Email']) as string
    }

    recipients.forEach(recipient => {
      mail.addTo(recipient.email, recipient.name)
    })

    mail.subject = subject.trim()
    mail.jsonBody = body

    return await MailApi.send(mail)
  }
}

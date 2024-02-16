import { ErrorCodes, ModuleError } from '../../../common/decorators/Error.js'
import { FormMail } from '../entities/FormMail.js'
import { MailApi } from '../../../common/repositories/MailApi.js'
import { MailRepository } from '../../../common/repositories/MailRepository.js'

export class FormMailService {
  public static async send(
    recipientId: Array<number | string>,
    subject: string,
    body: Record<string, string | number>
  ) {
    const recipients = await MailRepository.readMailAddresses(recipientId)
    const mail = new FormMail()

    if (!recipients.length) {
      throw new ModuleError('Recipient not found', ErrorCodes.BAD_REQUEST)
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

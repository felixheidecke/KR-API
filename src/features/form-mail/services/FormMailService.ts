import { HttpError } from '../../../common/decorators/Error.js'
import { jsonToCSV, jsonToText } from '../../../common/utils/convert-json.js'
import { Mail } from '../../../common/entities/Mail.js'
import { SendMailerApi } from '../../../common/gateways/SendMailerApi.js'
import { MailRepo } from '../../../common/gateways/MailRepo.js'
import { toFilenameWithDate } from '../../../common/utils/slugify.js'

export class FormMailService {
  public static async send(
    recipientId: Array<number | string>,
    subject: string,
    body: Record<string, string | number>,
    config: { attachBodyAsCSV?: boolean } = {}
  ) {
    const recipients = await MailRepo.readMailAddresses(recipientId)
    const mail = new Mail()

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
    mail.body = jsonToText(body)

    if (config.attachBodyAsCSV) {
      mail.attach(toFilenameWithDate(subject, 'csv'), jsonToCSV(body), 'text/csv')
    }

    return await SendMailerApi.send(mail)
  }
}

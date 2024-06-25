import { HttpError } from '../../../common/decorators/Error.js'
import { jsonToCSV, jsonToText } from '../../../common/utils/convert-json.js'
import { Mail } from '../../../common/entities/Mail.js'
import { SendMailerApi } from '../../../common/gateways/SendMailerApi.js'
import { FormmailRepo } from '../../../common/gateways/FormmailRepo.js'
import { toFilenameWithDate } from '../../../common/utils/slugify.js'
import { MIME_TYPE } from '../../../constants.js'

export class FormMailService {
  public static async send(
    recipientId: Array<number | string>,
    subject: string,
    body: Record<string, string | number>,
    config: { attachBodyAsCSV?: boolean } = {}
  ) {
    const recipients = await FormmailRepo.readMailAddresses(recipientId)
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
      mail.attach(toFilenameWithDate(subject, 'csv'), jsonToCSV(body), MIME_TYPE.CSV)
    }

    return await SendMailerApi.send(mail)
  }
}

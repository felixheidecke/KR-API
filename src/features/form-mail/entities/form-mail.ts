import { Mail } from '#common/entities/mail.js'
import { LOCALE } from '#utils/constants.js'

export class FormMail extends Mail {
  constructor() {
    super()
  }

  public set jsonBody(body: Record<string, string | number>) {
    this.body = Object.entries(body)
      .map(([key, value]) => {
        return `${key.toLocaleUpperCase(LOCALE)}: ${value.toString().trim()}`
      })
      .join('\n\n')
  }
}

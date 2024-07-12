import { Mail } from '#common/entities/mail.js'

export class FormMail extends Mail {
  constructor() {
    super()
  }

  public set jsonBody(body: Record<string, string | number>) {
    this.body = Object.entries(body)
      .map(([key, value]) => {
        return `${key.toLocaleUpperCase()}: ${value.toString().trim()}`
      })
      .join('\n\n')
  }
}

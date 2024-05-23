type MailMap = Map<string, string | null>
type MailAttachment = {
  filename: string
  content: string
  contentType: string
}

export class Mail {
  // --- [ Members ] -------------------------------------------------------------------------------

  public from: string = ''
  public subject: string = ''
  public replyTo?: string
  public body: string = ''
  public attachments: Array<MailAttachment> = []
  protected _to: MailMap = new Map()
  protected _cc: MailMap = new Map()
  protected _bcc: MailMap = new Map()

  // --- [ Getter ] --------------------------------------------------------------------------------

  public get to() {
    return this._to.size ? Mail.addressAdapter(this._to) : undefined
  }

  public get cc() {
    return this._cc.size ? Mail.addressAdapter(this._cc) : undefined
  }

  public get bcc() {
    return this._bcc.size ? Mail.addressAdapter(this._bcc) : undefined
  }

  // --- [ Methods ] -------------------------------------------------------------------------------

  public addTo(address: string, name?: string, as?: 'cc' | 'bcc') {
    switch (as) {
      case 'cc':
        this._cc.set(address.toLowerCase(), name || null)
        break
      case 'bcc':
        this._bcc.set(address.toLowerCase(), name || null)
        break
      default:
        this._to.set(address.toLowerCase(), name || null)
        break
    }
  }

  public attach(
    filename: MailAttachment['filename'],
    content: MailAttachment['content'],
    contentType: MailAttachment['contentType'] = 'text/plain'
  ) {
    this.attachments.push({ filename, content, contentType })
  }

  private static addressAdapter(map: MailMap) {
    return Array.from(map).map(([address, name]) => {
      if (!name) {
        return address
      } else {
        return `${name} <${address}>`
      }
    })
  }
}

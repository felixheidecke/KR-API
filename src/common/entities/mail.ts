export namespace Mail {
  export type Address = string
  export type AddressMap = Map<Address, string | null>
  export type Attachment = {
    filename: string
    content: string
    contentType: string
  }
}

export class Mail {
  // --- [ Members ] -------------------------------------------------------------------------------

  public from: string = ''
  public subject: string = ''
  public replyTo?: string
  public body: string = ''
  public attachments: Array<Mail.Attachment> = []
  protected _to: Mail.AddressMap = new Map()
  protected _cc: Mail.AddressMap = new Map()
  protected _bcc: Mail.AddressMap = new Map()

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
    filename: Mail.Attachment['filename'],
    content: Mail.Attachment['content'],
    contentType: Mail.Attachment['contentType'] = 'text/plain'
  ) {
    this.attachments.push({ filename, content, contentType })
  }

  private static addressAdapter(map: Mail.AddressMap) {
    return Array.from(map).map(([address, name]) => {
      if (!name) {
        return address
      } else {
        return `${name} <${address}>`
      }
    })
  }
}

type MailMap = Map<string, string | null>

export class Mail {
  // --- [ Members ] -------------------------------------------------------------------------------

  public from: string = ''
  public subject: string = ''
  public replyTo?: string
  public body: string = ''
  protected _to: MailMap = new Map()
  protected _cc: MailMap = new Map()
  protected _bcc: MailMap = new Map()

  // --- [ Setter ] --------------------------------------------------------------------------------

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

  // --- [ Getter ] --------------------------------------------------------------------------------

  public get to() {
    return this._to.size ? Mail.mailAdapter(this._to) : undefined
  }

  public get cc() {
    return this._cc.size ? Mail.mailAdapter(this._cc) : undefined
  }

  public get bcc() {
    return this._bcc.size ? Mail.mailAdapter(this._bcc) : undefined
  }

  // --- [ Methods ] -------------------------------------------------------------------------------

  private static mailAdapter(map: MailMap) {
    return Array.from(map).map(([address, name]) => {
      if (!name) {
        return address
      } else {
        return `${name} <${address}>`
      }
    })
  }
}

export class Client {
  constructor(readonly module: number) {}

  // --- [ Member ] --------------------------------------------------------------------------------

  public id = 0
  public name = ''
  public phone = ''
  public address = ''
  public zip = ''
  public city = ''
  public web: string | URL = ''
  private _email = ''

  // --- [ Setter ] --------------------------------------------------------------------------------

  set email(email: string) {
    this._email = email.trim().toLowerCase()
  }

  // --- [ Getter ] --------------------------------------------------------------------------------

  get email() {
    return this._email
  }

  public display() {
    return Object.freeze(new ClientDisplay(this))
  }
}

class ClientDisplay {
  constructor(client: Client) {
    this.$module = client.module
    this.$id = client.id
    this.name = client.name
    this.phone = client.phone
    this.address = client.address
    this.zip = client.zip
    this.city = client.city
    this.web = client.web.toString()
    this.email = client.email
  }

  readonly $module: number
  readonly $id: number
  readonly name: string
  readonly phone: string
  readonly address: string
  readonly zip: string
  readonly city: string
  readonly web: string
  readonly email: string
}

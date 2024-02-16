export class Customer {
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
    return Object.freeze({
      id: this.id,
      name: this.name,
      phone: this.phone,
      address: this.address,
      zip: this.zip,
      city: this.city,
      web: this.web.toString(),
      email: this.email
    })
  }
}

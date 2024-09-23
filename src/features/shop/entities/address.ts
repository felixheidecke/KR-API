export class Address {
  // --- [ Members ] -------------------------------------------------------------------------------

  _company: string | null = null
  _salutation: string | null = null
  _firstname: string | null = null
  _name: string | null = null
  _address: string | null = null
  _zip: string | null = null
  _city: string | null = null
  _email: string | null = null
  _phone: string | null = null

  // --- [ Setter ] --------------------------------------------------------------------------------

  set company(company: string | null | undefined) {
    this._company = company?.trim() || null
  }

  set salutation(salutation: 'Herr' | 'Frau' | string | null | undefined) {
    this._salutation = salutation || null
  }

  set firstname(firstname: string | null | undefined) {
    this._firstname = firstname?.trim() || null
  }

  set name(name: string | null | undefined) {
    this._name = name?.trim() || null
  }

  set address(address: string | null | undefined) {
    this._address = address?.trim() || null
  }

  set zip(zip: string | number | null | undefined) {
    this._zip = zip + '' || null
  }

  set city(city: string | null | undefined) {
    this._city = city?.trim() || null
  }

  set email(email: string | null | undefined) {
    this._email = email?.toLowerCase() || null
  }

  set phone(phone: string | number | null | undefined) {
    this._phone = (phone + '').trim() || null
  }

  // --- [ Getter ] -------------------------------------------------------------------------------

  get company(): string | null {
    return this._company
  }

  get salutation(): string | null {
    return this._salutation
  }

  get firstname(): string | null {
    return this._firstname
  }

  get name(): string | null {
    return this._name
  }

  get address(): string | null {
    return this._address
  }

  get zip(): string | null {
    return this._zip
  }

  get city(): string | null {
    return this._city
  }

  get email(): string | null {
    return this._email
  }

  get phone(): string | null {
    return this._phone
  }

  get size() {
    return Object.values(this.display()).filter(value => value).length
  }

  // --- [ Methods ] -------------------------------------------------------------------------------

  display() {
    return Object.freeze({
      company: this._company,
      salutation: this._salutation,
      firstname: this._firstname,
      name: this._name,
      address: this._address,
      zip: this._zip,
      city: this._city,
      email: this._email,
      phone: this._phone
    })
  }
}

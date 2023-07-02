import { NUMBER_FORMAT_CURRENCY } from '#constants'
import database from '#libs/database'
import SimpleQuery from '#libs/simple-query-builder'
import { getUnixTime } from 'date-fns'
import { v1 as uuid } from 'uuid'
import expandPrice from '#utils/expand-price'
import validator from 'validator'

export default class ShopOrder {
  #module
  #access = new Map()
  #errors = new Map()

  // Data
  #address = new Map()
  #amount = 0
  #products = []
  #date = 0
  #discount = 0
  #id = 0
  #message = ''
  #paymentType = 'prepayment'
  #shipping = 0
  #transactionId = undefined

  constructor(module) {
    if (!module) {
      throw new Error('Missing required parameter "module"')
    }

    this.#module = module
    this.#access.set('r', true)
    this.#access.set('w', true)
  }

  get date() {
    return this.#date || undefined
  }

  get exists() {
    return !!this.#amount
  }

  // --- Payment Type ----------------------------------------------------------

  set paymentType(type) {
    if (type === 'paypal') {
      this.#paymentType = type
    } else if (type === 'prepaid') {
      this.#paymentType = 'prepayment'
    }

    return this
  }

  get paymentType() {
    if (this.isPaypal) {
      return 'paypal'
    }

    if (this.isPrepaid) {
      return 'prepaid'
    }
  }

  get isPaypal() {
    return this.#paymentType === 'paypal'
  }

  get isPrepaid() {
    return this.#paymentType === 'prepayment'
  }

  // --- Cart ------------------------------------------------------------------

  addProduct({ id, code, name, price, quantity, total }) {
    this.#products.push({
      productId: id,
      productCode: code,
      productName: name,
      price: price.value,
      count: quantity,
      sum: total.value
    })
  }

  addProducts(products) {
    products.forEach((product) => {
      this.addProduct(product)
    })
  }

  set products(products) {
    this.#products = []
    products.forEach((product) => {
      this.addProduct(product)
    })
  }

  get products() {
    if (!this.#products.length) return

    return this.#products.map((product) => ({
      id: +product.productId,
      name: product.productName,
      code: product.productCode,
      quantity: product.count,
      price: expandPrice(+product.price),
      total: expandPrice(product.sum)
    }))
  }

  // --- Invoice Address -------------------------------------------------------

  set address(address) {
    if (!this.validateAddress(address)) return

    this.#address.set(
      'company',
      address.company ? validator.escape(address.company) : ''
    )
    this.#address.set('salutation', address.salutation)
    this.#address.set('firstname', validator.escape(address.firstname))
    this.#address.set('name', validator.escape(address.name))
    this.#address.set('address', validator.escape(address.address))
    this.#address.set('zip', +address.zip)
    this.#address.set('city', validator.escape(address.city))
    this.#address.set('email', address.email)
    this.#address.set(
      'phone',
      validator.whitelist(address.phone, '+0123456789')
    )

    this.message = address.message || ''
  }

  get address() {
    return this.#address.size ? Object.fromEntries(this.#address) : undefined
  }

  // --- Message ---------------------------------------------------------------

  set message(text) {
    this.#message = validator.escape(text.trim())
  }

  get message() {
    return this.#message
  }

  // --- Total, Shipping & Discount --------------------------------------------

  set total(value) {
    this.#amount = +value

    return this
  }

  get total() {
    return {
      value: this.#amount,
      formatted: NUMBER_FORMAT_CURRENCY.format(this.#amount)
    }
  }

  set discount(value) {
    this.#discount = +value

    return this
  }

  get discount() {
    const { discount } = this.#amount

    return {
      value: discount,
      formatted: NUMBER_FORMAT_CURRENCY.format(discount)
    }
  }

  set shippingCost(value) {
    this.#shipping = +value

    return this
  }

  get shippingCost() {
    return {
      value: this.#shipping,
      formatted: NUMBER_FORMAT_CURRENCY.format(this.#shipping)
    }
  }

  // --- IDs -------------------------------------------------------------------

  generateTransactionId() {
    this.#transactionId = uuid()

    return this
  }

  set transactionId(id) {
    this.#transactionId = id

    return this
  }

  get transactionId() {
    return this.#transactionId
  }

  set id(id) {
    this.#id = +id

    return this
  }

  get id() {
    return this.#id
  }

  get data() {
    return {
      transactionId: this.transactionId,
      date: this.date,
      address: this.address,
      message: this.message,
      products: this.products,
      shippingCost: this.shippingCost,
      paymentType: this.paymentType,
      total: this.total
    }
  }

  get errors() {
    if (!this.#errors.size) return null

    return Object.fromEntries(this.#errors)
  }

  async save() {
    if (!this.#access.has('w')) {
      this.#errors.set(
        'access',
        'Access is limited to ' + this.#access.entries().join()
      )
    }

    if (!this.address) {
      this.#errors.set('address', 'Invoice address missing')
    }

    if (!this.products) {
      this.#errors.set('cart', 'Cart has no items')
    }

    if (this.#errors.size) {
      return
    }

    if (!this.transactionId) {
      this.generateTransactionId()
    }

    if (!this.date) {
      this.#date = getUnixTime(new Date())
    }

    const query = new SimpleQuery()

    query.insertInto('rtd.Shop3Order', {
      date: this.#date,
      payment: this.#paymentType,
      transactionId: this.#transactionId,
      ...Object.fromEntries(this.#address),
      module: this.#module,
      amount: this.#amount,
      discount: this.#discount,
      order: JSON.stringify({
        cart: this.#products,
        shipping: this.#shipping,
        discountValue: 0
      })
    })

    const [result] = await database.execute(query.query)

    if (result.affectedRows === 1) {
      this.#id = result.insertId
      this.#access.delete('w')
    }
  }

  async load(transactionId) {
    this.#errors = new Map()
    const order = await ShopOrder.fetch(transactionId, this.#module)

    if (!order) {
      this.#errors.set('notFound', true)
      return
    }

    this.#access.delete('w')

    const cart = JSON.parse(order.order)

    this.#address.set('company', order.company)
    this.#address.set('salutation', order.salutation)
    this.#address.set('name', order.name)
    this.#address.set('firstname', order.firstname)
    this.#address.set('address', order.address)
    this.#address.set('zip', order.zip)
    this.#address.set('city', order.city)
    this.#address.set('phone', order.phone)
    this.#address.set('email', order.email)

    this.#amount = +order.amount
    this.#date = new Date(+order.date * 1000)
    this.#discount = +order.discount
    this.#id = +order._id
    this.#message = order.message || ''
    this.#paymentType = order.payment
    this.#products = cart.cart
    this.#shipping = +cart.shipping
  }

  static async fetch(transactionId, module) {
    const query = `
      SELECT
        *
      FROM
        Shop3Order
      WHERE
          transactionId = "${transactionId}" AND module = ${module}
      LIMIT 1`

    const [rows] = await database.execute(query)

    return rows.length ? rows[0] : null
  }

  validateAddress({
    salutation,
    firstname,
    name,
    address,
    zip,
    city,
    phone,
    email
  }) {
    const errors = {}

    // Salutation
    if (!['Herr', 'Frau'].includes(salutation)) {
      errors.salutation = 'Nur "Herr" oder "Frau" sind gültige Eingaben.'
    }

    // Firstname
    if (!firstname) {
      errors.firstname = 'Bitte geben Sie ihren Vornamen ein.'
    }

    // Lastname
    if (!name) {
      errors.name = 'Bitte geben Sie ihren Nachname ein.'
    }

    // Address
    if (!address) {
      errors.address = 'Bitte geben Sie Straße und Hausnummer ein.'
    }

    // ZIP
    if (!+zip || +zip.length > 5) {
      errors.zip = 'Bitte geben Sie eine gültige Postleitzahl ein.'
    }

    // City
    if (!city) {
      errors.city = 'Bitte geben Sie ihren Wohnort ein.'
    }

    // Phonenumber
    if (!phone) {
      errors.phone = 'Bitte geben Sie eine korrekte Telefonnummer ein.'
    }

    // Phonenumber
    if (!email || !validator.isEmail(email)) {
      errors.email = 'Bitte geben Sie eine valide E-Mail-Addresse ein.'
    }

    if (Object.keys(errors).length) {
      this.#errors.set('address', errors)
      return false
    } else {
      this.#errors.delete('address')
      return true
    }
  }

  export() {
    return {
      access: Array.from(this.#access),
      errors: Array.from(this.#errors),

      // Data
      address: Array.from(this.#address),
      amount: this.#amount,
      products: this.#products,
      date: this.#date,
      discount: this.#discount,
      id: this.#id,
      message: this.#message,
      paymentType: this.#paymentType,
      shipping: this.#shipping,
      transactionId: this.#transactionId
    }
  }

  import(order) {
    this.#access = new Map()
    this.#errors = new Map()

    // Data
    this.#address = new Map()
    this.#amount = order.amount
    this.#products = order.products
    this.#date = order.date
    this.#discount = order.discount
    this.#id = order.id
    this.#message = order.message
    this.#paymentType = order.paymentType
    this.#shipping = order.shipping
    this.#transactionId = order.transactionId

    order.access.forEach(([key, value]) => this.#access.set(key, value))
    order.errors.forEach(([key, value]) => this.#errors.set(key, value))
    order.address.forEach(([key, value]) => this.#address.set(key, value))
  }
}

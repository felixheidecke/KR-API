import { NUMBER_FORMAT_CURRENCY } from '#src/constants.js'
import database from '#src/libs/database.js'
import SimpleQuery from '#src/libs/simple-query-builder.js'
import { fromUnixTime, getUnixTime } from 'date-fns'
import { v1 as uuid } from 'uuid'
import { addSlashes } from 'slashes'

export class Shop3Order {
  #id = 0
  #address = null
  #amount = 0
  #discount = 0
  #shipping = 0
  #date = 0
  #paymentType = ''
  #transactionId = ''
  #message = ''
  #module = 0
  #cart = []

  get raw() {
    return Object.freeze({
      id: this.#id,
      transactionId: this.#transactionId,
      address: this.#address,
      amount: this.#amount,
      discount: this.#discount,
      date: this.#date,
      paymentType: this.#paymentType,
      message: this.#message,
      module: this.#module,
      order: {
        cart: this.#cart,
        shipping: this.#shipping,
        discountValue: this.#discount
      }
    })
  }

  // --- The lock prevents changes after save ----------------------------------

  locked = false

  isLocked() {
    return this.locked
  }

  unlock() {
    this.locked = false
  }

  checkLockedHandler() {
    if (this.locked) {
      throw 'Order locked'
    }
  }

  // --- Type ------------------------------------------------------------------

  setType(type) {
    this.checkLockedHandler()

    if (type === 'paypal') {
      this.#paymentType = type
    } else if (type === 'prepaid') {
      this.#paymentType = 'prepayment'
    }

    return this
  }

  get type() {
    if (this.isPaypal) {
      return 'paypal'
    }

    if (this.isPrepaid) {
      return 'prepaid'
    }
  }

  get usesPaypal() {
    return this.#paymentType === 'paypal'
  }

  get usesPrepaid() {
    return this.#paymentType === 'prepayment'
  }

  // --- Module ----------------------------------------------------------------

  setModule(module) {
    this.checkLockedHandler()

    this.#module = +module

    return this
  }

  get module() {
    return this.#module
  }

  // --- Date (getter only) ----------------------------------------------------

  get date() {
    if (!this.#date) return null

    return {
      value: this.#date,
      formatted: fromUnixTime(this.#date)
    }
  }

  // --- Cart ------------------------------------------------------------------

  addProduct({ id, code, name, price, quantity, total }) {
    this.checkLockedHandler()

    this.#cart.push({
      productId: id,
      productCode: code,
      productName: name,
      price,
      count: quantity,
      sum: total
    })
  }

  setProducts(cart) {
    this.#cart = cart
  }

  get products() {
    return this.#cart
  }

  // --- Invoice Address -------------------------------------------------------

  setAddress(address) {
    this.#address = {
      salutation: address.salutation,
      name: addSlashes(address.name),
      firstname: addSlashes(address.firstname),
      address: addSlashes(address.address),
      zip: parseInt(address.zip),
      city: addSlashes(address.city),
      email: addSlashes(address.email)
    }

    // Optionals

    if (address.company) {
      this.#address.company = addSlashes(address.company)
    }

    if (address.phone) {
      this.#address.phone = addSlashes(address.phone)
    }

    return this
  }

  get address() {
    return this.#address
  }

  // --- Message ---------------------------------------------------------------

  // --- Message ---------------------------------------------------------------

  setMessage(text) {
    text = text.trim()
    this.#message = addSlashes(text)

    return this
  }

  get message() {
    return this.#message
  }

  // --- Total, Shipping & Discount --------------------------------

  setTotal(value) {
    this.#amount = +value

    return this
  }

  get total() {
    return {
      value: this.#amount,
      formatted: NUMBER_FORMAT_CURRENCY.format(this.#amount)
    }
  }

  discount(value) {
    this.#discount = +value

    return this
  }

  get discount() {
    return {
      value: this.#discount,
      formatted: NUMBER_FORMAT_CURRENCY.format(this.#discount)
    }
  }

  setShippingCost(value) {
    this.#shipping = +value

    return this
  }

  get shippingCost() {
    return {
      value: this.#shipping,
      formatted: NUMBER_FORMAT_CURRENCY.format(this.#shipping)
    }
  }

  // --- Database & Transaction ID ---------------------------------------------

  generateTransactionId() {
    this.#transactionId = uuid()
    this.locked = false
  }

  setTransactionId(id) {
    this.#transactionId = id
    this.locked = false

    return this
  }

  get transactionId() {
    return this.#transactionId
  }

  get id() {
    return this.#id
  }

  async save() {
    if (this.locked) {
      throw 'Order is locked!'
    }

    if (!this.#address) {
      throw 'Invoice address missing'
    }

    if (!this.#cart.length) {
      throw 'Cart has no items'
    }

    this.#date = getUnixTime(new Date())

    if (!this.#transactionId) {
      this.generateTransactionId()
    }

    await this.#insert()

    return this
  }

  reset() {
    this.#address = null
    this.#amount = 0
    this.#discount = 0
    this.#shipping = 0
    this.#date = 0
    this.#paymentType = ''
    this.#transactionId = ''
    this.#message = ''
    this.#module = 0
    this.#cart = []
  }

  async fetch(transactionId) {
    if (!transactionId) return

    await this.#fetch(transactionId)

    return this
  }

  // --- Helper ----------------------------------------------------------------

  async #insert() {
    const query = new SimpleQuery()

    query.insertInto('rtd.Shop3Order', {
      date: this.#date,
      payment: this.#paymentType,
      transactionId: this.#transactionId,
      ...this.#address,
      module: this.#module,
      amount: this.#amount,
      discount: this.#discount,
      order: JSON.stringify({
        cart: this.#cart,
        shipping: this.#shipping,
        discountValue: this.#discount
      })
    })

    try {
      const [result] = await database.execute(query.query)

      if (result.affectedRows === 1) {
        this.#id = result.insertId
        this.locked = true
      } else {
        throw 'Could not write to database'
      }
    } catch (error) {
      console.error(error)
      throw error
    } finally {
      return
    }
  }

  async #fetch(transactionId) {
    // const query = new SimpleQuery()
    //   .select()
    //   .from('rtd.Shop3Order')
    //   .where('transactionId = ?')
    //   .limit(1).query
    // const [rows] = await database.execute(query, [transactionId])
    // if (!rows.length) return null
    // this.#order = {
    //   ...rows[0],
    //   cart: JSON.parse(rows[0].order)
    // }
  }
}

// 4EY457485D480415Y

import { NUMBER_FORMAT_CURRENCY } from '#constants'
import database from '#libs/database'

export default class ShopAdditionalCost {
  #module

  // Data
  #amount = 0
  #title = ''

  constructor(module = 0) {
    this.#module = module
  }

  get amount() {
    return {
      value: this.#amount,
      formatted: NUMBER_FORMAT_CURRENCY.format(this.#amount)
    }
  }

  get title() {
    return this.#title
  }

  get module() {
    return this.#module
  }

  get data() {
    return {
      amount: this.amount,
      title: this.title
    }
  }

  async load() {
    if (!this.#module) {
      throw new Error('Missing required attribute "module"')
    }

    const query = `
      SELECT s.extracostAmount as amount,
              s.extracostTitle as title
      FROM   rtd.Shop3ShippingCharges AS s
      JOIN   rtd.Shop3ShippingChargesWeight AS w ON s._id = w.charges
      WHERE  s.module = ${this.#module}
      LIMIT  1`

    const [rows] = await database.execute(query)

    if (rows.length) {
      this.#amount = +rows[0].amount
      this.#title = rows[0].title.trim()
    }
  }

  export() {
    return {
      amount: this.#amount,
      title: this.#title
    }
  }
}

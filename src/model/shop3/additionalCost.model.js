import database from '#libs/database'

export class Shop3AdditionalCost {
  #additionalCost = null

  /** @returns {object|Promise<object>} additional costs */

  get export() {
    return Object.freeze(this.#additionalCost)
  }

  hasCost() {
    return !!this.#additionalCost.amount
  }

  getAmount() {
    return this.#additionalCost.amount
  }

  getTitle() {
    return this.#additionalCost.title
  }

  async fetch(module) {
    if (!module) throw new Error('missing required attribute "module"')

    await this.#fetchAdditionalCost(module)

    return this
  }

  async #fetchAdditionalCost(module) {
    const query = `
      SELECT s.extracostAmount as amount,
              s.extracostTitle as title
      FROM   rtd.Shop3ShippingCharges AS s
      JOIN   rtd.Shop3ShippingChargesWeight AS w ON s._id = w.charges
      WHERE  s.module = ?
      LIMIT  1`

    const [rows] = await database.execute(query, [module])

    this.#additionalCost = !rows.length
      ? {
          amount: 0,
          title: ''
        }
      : {
          amount: +rows[0].amount,
          title: rows[0].title.trim()
        }

    return this.#additionalCost
  }
}

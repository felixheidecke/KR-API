import knex from '../../../services/knex.js'
import { SupplementalCost } from '../entities/SupplementalCost.js'

export type RawSupplementalCost = {
  price: number
  title: string | null
  description: string | null
}

export class SupplementalCostRepository {
  static async getSupplementalCost(module: number) {
    const data = await knex('Shop3ShippingCharges AS s')
      .select({
        price: 's.extracostAmount',
        title: 's.extracostTitle',
        description: 's.text'
      })
      .join('Shop3ShippingChargesWeight AS w', 's._id', '=', 'w.charges')
      .where('s.module', module)
      .first()

    return data ? toEntity(module, data) : null
  }
}

// Helper function

function toEntity(module: number, raw: RawSupplementalCost) {
  const cost = new SupplementalCost(module)

  cost.price = raw.price
  cost.title = raw.title || ''
  cost.description = raw.description || ''

  return cost
}

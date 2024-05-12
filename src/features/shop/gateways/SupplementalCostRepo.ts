import knex from '../../../modules/knex.js'
import { SupplementalCost } from '../entities/SupplementalCost.js'

export namespace SupplementalCostRepo {
  export type SupplementalCost = {
    module: number
    price: number
    title: string | null
    description: string | null
  }
}

export class SupplementalCostRepo {
  static async readSupplementalCost(
    module: number
  ): Promise<SupplementalCostRepo.SupplementalCost | null> {
    const supplementalCost = await knex('Shop3ShippingCharges AS s')
      .select({
        module: 's.module',
        price: 's.extracostAmount',
        title: 's.extracostTitle',
        description: 's.text'
      })
      .join('Shop3ShippingChargesWeight AS w', 's._id', '=', 'w.charges')
      .where('s.module', module)
      .first()

    return supplementalCost || null
  }
}

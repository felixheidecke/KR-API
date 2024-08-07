import knex from '#libs/knex.js'

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
    const supplementalCost = await knex('Shop3ShippingCharges AS charges')
      .select({
        module: 'charges.module',
        price: 'charges.extracostAmount',
        title: 'charges.extracostTitle',
        description: 'charges.text'
      })
      .join('Shop3ShippingChargesWeight AS weight', 'charges._id', '=', 'weight.charges')
      .where('charges.module', module)
      .first()

    return supplementalCost || null
  }
}

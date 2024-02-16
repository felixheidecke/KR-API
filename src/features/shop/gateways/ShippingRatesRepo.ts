import knex from '../../../modules/knex.js'

export type RepoShippingRate = {
  module: number
  price: number
  threshold: number
  freeShippingThreshold: number
  unit: string
}

export class ShippingRatesRepo {
  static async readShippingRates(module: number): Promise<RepoShippingRate[] | null> {
    const response = await knex('Shop3ShippingCharges AS charges')
      .select({
        price: 'weight.charge',
        module: 'charges.module',
        threshold: 'weight.upToWeight',
        freeShippingThreshold: 'charges.freeFrom',
        unit: 'attr.value'
      })
      .join('Shop3ShippingChargesWeight AS weight', 'charges._id', '=', 'weight.charges')
      .leftJoin('ModuleAttribute AS attr', function () {
        this.on('attr.module', '=', knex.raw(module)).andOn(
          'attr.name',
          '=',
          knex.raw('"shipping.unit"')
        )
      })
      .where('charges.module', module)
      .orderBy('weight.upToWeight', 'asc')

    return response.length ? response : null
  }
}

// --- [ Helper ] ----------------------------------------------------------------------------------

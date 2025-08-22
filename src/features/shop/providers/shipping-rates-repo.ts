import knex from '#libs/knex.js'

export namespace ShippingChargesRepo {
  export type ShippingRate = {
    module: number
    price: number
    threshold: number
    freeShippingThreshold: number
    unit: string
    text: string
  }
  export type Text = string
}

export class ShippingChargesRepo {
  static async readShippingRates(module: number): Promise<ShippingChargesRepo.ShippingRate[]> {
    const response = await knex('Shop3ShippingCharges AS charges')
      .select({
        price: 'weight.charge',
        module: 'charges.module',
        threshold: 'weight.upToWeight',
        freeShippingThreshold: 'charges.freeFrom',
        unit: 'attr.value',
        text: 'charges.text'
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

    return response
  }
}

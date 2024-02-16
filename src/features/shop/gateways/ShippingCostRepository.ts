import { ShippingCost } from '../entities/ShippingCost.js'
import knex from '../../../services/knex.js'

type RawShippingCost = {
  price: number
  threshold: number
  freeShippingThreshold: number
  unit: string
}

export class ShippingCostRepository {
  static async getShippingCost(module: number) {
    const response = await knex('Shop3ShippingCharges AS charges')
      .select({
        price: 'weight.charge',
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

    return response.length ? toEntity(module, response as RawShippingCost[]) : null
  }
}

// --- [ Helper ] ----------------------------------------------------------------------------------

function toEntity(module: number, raw: RawShippingCost[]) {
  const shippingCost = new ShippingCost(module)
  shippingCost.freeShippingThreshold = raw[0]?.freeShippingThreshold as number

  if (raw[0]?.unit) {
    shippingCost.unit = raw[0]?.unit
  }

  raw.map(({ price, threshold }) => {
    shippingCost.addRate(threshold, price)
  })

  return shippingCost
}

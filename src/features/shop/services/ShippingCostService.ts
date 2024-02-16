import { head } from 'lodash-es'
import { ShippingCost } from '../entities/ShippingCost.js'
import { ShippingRatesRepo, type RepoShippingRate } from '../gateways/ShippingRatesRepo.js'

export class ShippingCostService {
  static async getShippingCost(module: number, config: { shouldThrow?: boolean } = {}) {
    const repoShippingCost = await ShippingRatesRepo.readShippingRates(module)

    if (!repoShippingCost && config.shouldThrow) {
      throw new Error('Shipping cost not found.')
    }

    return repoShippingCost ? createShippingCostFromRepo(repoShippingCost) : null
  }
}

function createShippingCostFromRepo(repoShippingCost: RepoShippingRate[]) {
  const shippingCost = new ShippingCost(head(repoShippingCost)?.module as number)
  shippingCost.freeShippingThreshold = head(repoShippingCost)?.freeShippingThreshold as number

  if (repoShippingCost[0]?.unit) {
    shippingCost.unit = head(repoShippingCost)?.unit as string
  }

  repoShippingCost.map(({ price, threshold }) => {
    shippingCost.addRate(threshold, price)
  })

  return shippingCost
}

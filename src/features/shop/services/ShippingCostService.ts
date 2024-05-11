import { head } from 'lodash-es'
import { ShippingCost } from '../entities/ShippingCost.js'
import { ShippingRatesRepo, type RepoShippingRate } from '../gateways/ShippingRatesRepo.js'
import { ModuleRepo } from '../../../common/gateways/ModuleRepo.js'
import { HttpError } from '../../../common/decorators/Error.js'

export class ShippingCostService {
  static async getShippingCost(
    module: number,
    config: {
      skipModuleCheck?: boolean
      shouldThrow?: boolean
    } = {}
  ) {
    const [moduleExists, repoShippingCost] = await Promise.all([
      config.shouldThrow ? ModuleRepo.moduleExists(module) : Promise.resolve(true),
      ShippingRatesRepo.readShippingRates(module)
    ])

    if (!moduleExists && config.shouldThrow) {
      throw HttpError.NOT_FOUND('Module not found.')
    }

    if (config.shouldThrow && !moduleExists) {
      throw HttpError.NOT_FOUND('Module not found')
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

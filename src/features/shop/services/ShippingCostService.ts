import { head } from 'lodash-es'
import { ShippingCost } from '../entities/ShippingCost.js'
import { ShippingRatesRepo } from '../gateways/ShippingRatesRepo.js'
import { ModuleRepo } from '../../../common/gateways/ModuleRepo.js'
import { HttpError } from '../../../common/decorators/Error.js'

type BaseConfig = {
  skipModuleCheck?: boolean
  shouldThrow?: boolean
}

export interface ShippingCostService {
  getShippingCost(module: number, config?: BaseConfig): Promise<ShippingCost | null>
}

export class ShippingCostService {
  static async getShippingCost(module: number, { skipModuleCheck, shouldThrow }: BaseConfig = {}) {
    const [moduleExists, repoShippingCost] = await Promise.all([
      skipModuleCheck ? ModuleRepo.moduleExists(module) : Promise.resolve(true),
      ShippingRatesRepo.readShippingRates(module)
    ])

    if (!moduleExists && shouldThrow) {
      throw HttpError.NOT_FOUND('Module not found.')
    }

    if (shouldThrow && !moduleExists) {
      throw HttpError.NOT_FOUND('Module not found')
    }

    return repoShippingCost ? createShippingCostFromRepo(repoShippingCost) : null
  }
}

function createShippingCostFromRepo(repoShippingCost: ShippingRatesRepo.ShippingRate[]) {
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

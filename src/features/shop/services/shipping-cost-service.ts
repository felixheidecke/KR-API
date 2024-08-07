import { head } from 'lodash-es'
import { ShippingRatesRepo } from '../providers/shipping-rates-repo.js'
import { ShippingCost } from '../entities/shipping-cost.js'
import { ModuleRepo } from '#common/providers/module-repo.js'
import { HttpError } from '#utils/http-error.js'

type BaseConfig = {
  skipModuleCheck?: boolean
}

export namespace ShippingCostService {
  export type GetShippingCost = (module: number, config?: BaseConfig) => Promise<ShippingCost>
}

export class ShippingCostService {
  static getShippingCost: ShippingCostService.GetShippingCost = async (
    moduleId,
    { skipModuleCheck } = {}
  ) => {
    const [moduleExists, repoShippingCost] = await Promise.all([
      skipModuleCheck ? ModuleRepo.moduleExists(moduleId) : Promise.resolve(true),
      ShippingRatesRepo.readShippingRates(moduleId)
    ])

    if (!moduleExists) {
      throw HttpError.NOT_FOUND('Module not found')
    }

    return createShippingCostFromRepo(repoShippingCost)
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

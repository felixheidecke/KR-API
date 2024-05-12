import { HttpError } from '../../../common/decorators/Error.js'
import { ModuleRepo } from '../../../common/gateways/ModuleRepo.js'
import { SupplementalCost } from '../entities/SupplementalCost.js'
import { SupplementalCostRepo } from '../gateways/SupplementalCostRepo.js'

type BaseConfig = {
  skipModuleCheck?: boolean
  shouldThrow?: boolean
}

export interface SupplementalCostService {
  getSupplementalCost(module: number, config?: BaseConfig): Promise<SupplementalCost | null>
}

export class SupplementalCostService {
  static async getSupplementalCost(
    module: number,
    { skipModuleCheck, shouldThrow }: BaseConfig = {}
  ) {
    const [moduleExists, supplementalCost] = await Promise.all([
      skipModuleCheck ? ModuleRepo.moduleExists(module) : Promise.resolve(true),
      SupplementalCostRepo.readSupplementalCost(module)
    ])

    if (!moduleExists && shouldThrow) {
      throw HttpError.NOT_FOUND('Module not found.')
    }

    if (!supplementalCost && shouldThrow) {
      throw HttpError.NOT_FOUND('Supplemental cost not found.')
    }

    return supplementalCost ? this.createSupplementalCostFromRepo(supplementalCost) : null
  }

  private static createSupplementalCostFromRepo(
    repoSupplementalCost: SupplementalCostRepo.SupplementalCost
  ) {
    const cost = new SupplementalCost(repoSupplementalCost.module)

    cost.price = repoSupplementalCost.price
    cost.title = repoSupplementalCost.title || ''
    cost.description = repoSupplementalCost.description || ''

    return cost
  }
}

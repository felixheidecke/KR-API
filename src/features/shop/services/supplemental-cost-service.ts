import { ModuleRepo } from '#common/providers/module-repo.js'
import { HttpError } from '#utils/http-error.js'
import { SupplementalCost } from '../entities/supplemental-cost.js'
import { SupplementalCostRepo } from '../providers/supplemental-cost-repo.js'

type BaseConfig = {
  skipModuleCheck?: boolean
}

export namespace SupplementalCostService {
  export type GetSupplementalCost = (
    module: number,
    config?: BaseConfig
  ) => Promise<SupplementalCost>
}

export class SupplementalCostService {
  static getSupplementalCost: SupplementalCostService.GetSupplementalCost = async (
    moduleId,
    { skipModuleCheck } = {}
  ) => {
    const [moduleExists, supplementalCost] = await Promise.all([
      skipModuleCheck ? ModuleRepo.moduleExists(moduleId) : Promise.resolve(true),
      SupplementalCostRepo.readSupplementalCost(moduleId)
    ])

    if (!moduleExists) {
      throw HttpError.NOT_FOUND('Module not found.')
    }

    if (!supplementalCost) {
      throw HttpError.NOT_FOUND('Supplemental cost not found.')
    }

    return this.createSupplementalCostFromRepo(supplementalCost)
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

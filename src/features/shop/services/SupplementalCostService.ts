import { HttpError } from '../../../common/decorators/Error.js'
import { ModuleRepo } from '../../../common/gateways/ModuleRepo.js'
import { SupplementalCost } from '../entities/SupplementalCost.js'
import {
  SupplementalCostRepo,
  type RepoSupplementalCost
} from '../gateways/SupplementalCostRepo.js'

export class SupplementalCostService {
  static async getSupplementalCost(
    module: number,
    config: {
      skipModuleCheck?: boolean
      shouldThrow?: boolean
    } = {}
  ) {
    const [moduleExists, supplementalCost] = await Promise.all([
      config.shouldThrow ? ModuleRepo.moduleExists(module) : Promise.resolve(true),
      SupplementalCostRepo.readSupplementalCost(module)
    ])

    if (!moduleExists && config.shouldThrow) {
      throw HttpError.NOT_FOUND('Module not found.')
    }

    if (!supplementalCost && config.shouldThrow) {
      throw HttpError.NOT_FOUND('Supplemental cost not found.')
    }

    return supplementalCost ? this.createSupplementalCostFromRepo(supplementalCost) : null
  }

  private static createSupplementalCostFromRepo(repoSupplementalCost: RepoSupplementalCost) {
    const cost = new SupplementalCost(repoSupplementalCost.module)

    cost.price = repoSupplementalCost.price
    cost.title = repoSupplementalCost.title || ''
    cost.description = repoSupplementalCost.description || ''

    return cost
  }
}

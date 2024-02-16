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
      shouldThrow?: boolean
      skipModuleCheck?: boolean
    } = {}
  ) {
    if (!config.skipModuleCheck && !(await ModuleRepo.moduleExists(module))) {
      if (config.shouldThrow) {
        throw HttpError.NOT_FOUND('Module not found.')
      }

      return null
    }

    const repoSupplementalCost = await SupplementalCostRepo.readSupplementalCost(module)

    if (!repoSupplementalCost && config.shouldThrow) {
      throw HttpError.NOT_FOUND('Supplemental cost not found.')
    }

    return repoSupplementalCost
      ? this.utils.createSupplementalCostFromRepo(repoSupplementalCost)
      : null
  }

  static get utils() {
    return {
      createSupplementalCostFromRepo
    }
  }
}

// Helper functions

function createSupplementalCostFromRepo(repoSupplementalCost: RepoSupplementalCost) {
  const cost = new SupplementalCost(repoSupplementalCost.module)

  cost.price = repoSupplementalCost.price
  cost.title = repoSupplementalCost.title || ''
  cost.description = repoSupplementalCost.description || ''

  return cost
}

import { groupBy, head, isNull } from 'lodash-es'
import { HttpError } from '#utils/http-error.js'
import { Image } from '#common/entities/image.js'
import { MenuCard } from '../entities/menu-card.js'
import { MenuCardRepo } from '../providers/menu-card-repo.js'
import { ModuleRepo } from '#common/providers/module-repo.js'

import type { RepoMenuCard } from '../providers/menu-card-repo.js'

export class MenuCardService {
  public static async getMenuCard(
    module: number,
    config: {
      shouldThrow?: boolean
      skipModuleCheck?: boolean
    } = {}
  ) {
    if (!config.skipModuleCheck && isNull(await ModuleRepo.readModule(module))) {
      if (config.shouldThrow) {
        throw HttpError.NOT_FOUND('Module not found.')
      }

      return null
    }

    return await MenuCardRepo.readMenuCard(module).then(repoMenuCard => {
      if (!repoMenuCard && config.shouldThrow) {
        throw HttpError.NOT_FOUND('Menu card not found.')
      }

      if (!repoMenuCard) {
        return null
      }

      return this.createMenuCardFromRepo(repoMenuCard)
    })
  }

  /**
   * Adapter function to group menu items by groups and convert them into MenuCard format.
   *
   * @param {number} module - The module identifier.
   * @param {RepoMenuCard[]} group - Array of menu items from the repo.
   * @returns {MenuCard[]} An array of MenuCard objects.
   */

  private static createMenuCardFromRepo(repoMenuCard: RepoMenuCard[]) {
    return Object.values(groupBy(repoMenuCard, 'category_id')).map(card => {
      const menuCard = new MenuCard(head(card)?.module as number)

      menuCard.name = head(card)?.category as string
      menuCard.description = head(card)?.category_description as string
      menuCard.items = card.map(item => {
        return {
          title: item.title,
          description: item.description,
          price: item.price,
          image: item.image ? new Image(item.image, item.title) : undefined
        }
      })

      return menuCard
    })
  }
}

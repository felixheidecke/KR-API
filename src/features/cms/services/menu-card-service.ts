import { groupBy, head } from 'lodash-es'
import { HttpError } from '#utils/http-error.js'
import { Image } from '#common/entities/image.js'
import { MenuCard } from '../entities/menu-card.js'
import { MenuCardRepo } from '../providers/menu-card-repo.js'
import { ModuleRepo } from '#common/providers/module-repo.js'

type Config = {
  skipModuleCheck?: boolean
}

export namespace MenuCardService {
  export type GetMenuCardByModule = (module: number, config?: Config) => Promise<MenuCard[]>
}

export class MenuCardService {
  public static getMenuCardByModule: MenuCardService.GetMenuCardByModule = async (
    module,
    config = {}
  ) => {
    const [moduleExists, repoMenuCard] = await Promise.all([
      config.skipModuleCheck ? ModuleRepo.moduleExists(module) : Promise.resolve(true),
      MenuCardRepo.readMenuCard(module)
    ])

    if (!moduleExists) {
      throw HttpError.NOT_FOUND('Module not found.')
    }

    if (!repoMenuCard) {
      throw HttpError.NOT_FOUND('Menu card not found.')
    }

    return repoMenuCard.length ? this.createMenuCardFromRepo(repoMenuCard) : []
  }

  /**
   * Adapter function to group menu items by groups and convert them into MenuCard format.
   *
   * @param {number} module - The module identifier.
   * @param {RepoMenuCard[]} group - Array of menu items from the repo.
   * @returns {MenuCard[]} An array of MenuCard objects.
   */

  private static createMenuCardFromRepo(repoMenuCard: MenuCardRepo.MenuCard[]) {
    return Object.values(groupBy(repoMenuCard, 'category_id')).map(card => {
      const menuCard = new MenuCard(head(card)?.module as number)

      menuCard.name = head(card)?.category as string
      menuCard.description = head(card)?.category_description as string
      menuCard.items = card.map(item => {
        return {
          id: item.id,
          name: item.title,
          description: item.description,
          price: item.price,
          image: item.image ? new Image(item.image, item.title) : undefined
        }
      })

      return menuCard
    })
  }
}

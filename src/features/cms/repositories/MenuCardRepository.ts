import { groupBy, head } from 'lodash-es'
import { Image } from '../../../common/entities/Image.js'
import { MenuCard } from '../model/MenuCard.js'
import { ModuleRepository } from '../../shop/gateways/ModuleRepository.js'
import knex from '../../../services/knex.js'

type RepositoryMenuCard = {
  id: number
  title: string
  description: string
  price: number
  image: string | null
  category: string
  category_description: string
  category_id: number
}

export class MenuCardRepository {
  /**
   * Reads and returns menu cards for a specific module.
   *
   * @param {number} module - The module identifier.
   * @returns {Promise<MenuCard[] | null>} A promise that resolves to an array of MenuCard objects or null if the module doesn't exist.
   */

  public static async readMenuCard(module: number): Promise<MenuCard[] | null> {
    const moduleExists = await ModuleRepository.moduleExists(module)

    if (!moduleExists) return null

    const menuCard = await knex
      .select({
        id: 'Item._id',
        title: 'Item.title',
        description: 'Item.description',
        price: 'Item.price',
        image: 'Item.image',
        category: 'Section.title',
        category_description: 'Section.description',
        category_id: 'Section._id'
      })
      .from('MenuItem as Item')
      .leftJoin('MenuSection as Section', 'Item.section', 'Section._id')
      .where('Item.active', 1)
      .andWhere('Item.module', module)
      .orderBy('Section.priority')
      .orderBy('Item.priority')

    return menuCard ? this.convertToMenuCard(module, menuCard as RepositoryMenuCard[]) : null
  }

  /**
   * Adapter function to group menu items by categories and convert them into MenuCard format.
   *
   * @param {number} module - The module identifier.
   * @param {RepoMenuCard[]} group - Array of menu items from the repository.
   * @returns {MenuCard[]} An array of MenuCard objects.
   */

  private static convertToMenuCard(module: number, repositoryMenuCard: RepositoryMenuCard[]) {
    return Object.values(groupBy(repositoryMenuCard, 'category_id')).map(card => {
      const menuCard = new MenuCard(module)

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

import knex from '../../../modules/knex.js'

export type RepoMenuCard = {
  id: number
  module: number
  title: string
  description: string
  price: number
  image: string | null
  category: string
  category_description: string
  category_id: number
}

export class MenuCardRepo {
  /**
   * Reads and returns menu cards for a specific module.
   *
   * @param {number} module - The module identifier.
   * @returns {Promise<MenuCard[] | null>} A promise that resolves to an array of MenuCard objects or null if the module doesn't exist.
   */

  public static async readMenuCard(module: number): Promise<RepoMenuCard[] | null> {
    const repoMenuCard = await knex
      .select({
        id: 'Item._id',
        module: 'Item.module',
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

    return repoMenuCard || null
  }
}

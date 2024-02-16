import { CategoryRepository } from '../gateways/CategoryRepository.js'
import { DetailLevel } from '../utils/detail-level.js'
import { ErrorCodes, ModuleError } from '../../../common/decorators/Error.js'

export class CategoryService {
  /**
   * Retrieves a specific category by its ID.
   *
   * @param {number} module - The module number.
   * @param {number} id - The ID of the category to be retrieved.
   * @returns {Promise<Category>} A promise that resolves to the retrieved category.
   * @throws {ModuleError} If the category is not found.
   */

  public static async getCategory(module: number, id: number, complexity?: DetailLevel) {
    const category = await CategoryRepository.getCategory(module, id, complexity)

    if (!category) {
      throw new ModuleError('Category not found.', ErrorCodes.NOT_FOUND)
    }

    return category
  }

  /**
   * Retrieves all categories for a given module.
   * Only top-level categories are retrieved, with their subcategories included.
   *
   * @param {number} module - The module number.
   * @returns {Promise<Category[]>} A promise that resolves to an array of categories.
   * @throws {ModuleError} If no categories are found.
   */

  public static async getCategories(module: number, complexity?: DetailLevel) {
    const categories = await CategoryRepository.getCategories(module, {}, complexity)

    if (!categories) {
      throw new ModuleError('No categories found.', ErrorCodes.NOT_FOUND)
    }

    return categories
  }
}

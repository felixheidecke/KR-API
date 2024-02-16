import { ErrorCodes, ModuleError } from '../../../common/decorators/Error.js'
import { MenuCardRepository } from '../repositories/MenuCardRepository.js'

export class MenuCardService {
  public static async getMenuCard(module: number) {
    const menuCard = await MenuCardRepository.readMenuCard(module)

    if (!menuCard) {
      throw new ModuleError('Menu card not found', ErrorCodes.NOT_FOUND)
    }

    return menuCard
  }
}

import { HttpError } from '../decorators/Error.js'
import { ModuleRepo } from '../gateways/ModuleRepo.js'
import Module from '../entities/Module.js'

export class ModuleService {
  /**
   * Retrieves a module by ID and type.
   * @param {number} id - The ID of the module.
   * @param {string} [type] - The type of the module.
   * @returns {Promise<Module|null>} - The retrieved module, or null if not found.
   */
  public static async getModule(
    id: number,
    type?: string,
    config: {
      shouldThrow?: boolean
    } = {}
  ) {
    const repoModule = await ModuleRepo.readModule(id, type)

    if (!repoModule && config.shouldThrow) {
      throw HttpError.NOT_FOUND('Module not found.')
    }

    return repoModule ? ModuleServiceUtils.createModuleFromRepo(repoModule) : null
  }

  /**
   * Retrieves all modules.
   * @returns {Promise<Module[]>} - Array of modules.
   */
  public static async getModules(config: { shouldThrow?: boolean } = {}) {
    const repoModules = await ModuleRepo.readModules()

    if (!repoModules && config.shouldThrow) {
      throw HttpError.NOT_FOUND('Modules not found.')
    }

    return repoModules ? repoModules.map(ModuleServiceUtils.createModuleFromRepo) : null
  }

  /**
   * Retrieves modules by client ID.
   * @param {number} id - The ID of the client.
   * @returns {Promise<Module[]>} - Array of modules belonging to the client.
   */
  public static async getModulesByClientId(
    id: number,
    config: {
      shouldThrow?: boolean
    } = {}
  ) {
    const repoModules = await ModuleRepo.readModulesByClient(id)

    if (!repoModules && config.shouldThrow) {
      throw HttpError.NOT_FOUND('Modules not found.')
    }

    return repoModules ? repoModules.map(ModuleServiceUtils.createModuleFromRepo) : null
  }
}

export class ModuleServiceUtils {
  /**
   * Maps a repository module to a Module entity.
   * @param {RepoModule} repoModule - The repository module to map.
   * @returns {Module} - The mapped Module entity.
   */
  public static createModuleFromRepo(repoModule: ModuleRepo.Module) {
    const module = new Module(repoModule.id)

    module.customer = repoModule.customer
    module.name = repoModule.name
    module.type = repoModule.type
    module.url = repoModule.url || ''

    return module
  }
}

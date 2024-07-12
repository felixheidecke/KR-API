import { HttpError } from '#utils/http-error.js'
import { ModuleRepo } from '../providers/module-repo.js'
import Module from '../entities/module.js'

// --- [ Namespace ] -------------------------------------------------------------------------------

export namespace ModuleService {
  type Config = { shouldThrow?: boolean }

  export type GetModule = (id: number, type?: string, config?: Config) => Promise<Module | null>
  export type GetModules = (config?: Config) => Promise<Module[] | null>
  export type GetModulesByClientId = (id: number, config?: Config) => Promise<Module[] | null>
}

// --- [ Class ] -----------------------------------------------------------------------------------

export class ModuleService {
  /**
   * Retrieves a module by ID and type.
   * @param {number} id - The ID of the module.
   * @param {string} [type] - The type of the module.
   * @returns {Promise<Module|null>} - The retrieved module, or null if not found.
   */
  public static getModule: ModuleService.GetModule = async (id, type, config = {}) => {
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
  public static getModules: ModuleService.GetModules = async (config = {}) => {
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
  public static getModulesByClientId: ModuleService.GetModulesByClientId = async (
    id,
    config = {}
  ) => {
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

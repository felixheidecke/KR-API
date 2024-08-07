import { HttpError } from '#utils/http-error.js'
import { ModuleRepo } from '../providers/module-repo.js'
import Module from '../entities/module.js'

// --- [ Namespace ] -------------------------------------------------------------------------------

export namespace ModuleService {
  export type GetModule = (id: number, type?: string) => Promise<Module>
  export type GetModules = () => Promise<Module[]>
  export type GetModulesByClientId = (id: number) => Promise<Module[]>
}

// --- [ Class ] -----------------------------------------------------------------------------------

export class ModuleService {
  /**
   * Retrieves a module by ID and type.
   * @param {number} id - The ID of the module.
   * @param {string} [type] - The type of the module.
   * @returns {Promise<Module>} - The retrieved module, or null if not found.
   */
  public static getModule: ModuleService.GetModule = async (id, type) => {
    const repoModule = await ModuleRepo.readModule(id, type)

    if (!repoModule) {
      throw HttpError.NOT_FOUND('Module not found.')
    }

    return ModuleServiceUtils.createModuleFromRepo(repoModule)
  }

  /**
   * Retrieves all modules.
   * @returns {Promise<Module[]>} - Array of modules.
   */
  public static getModules: ModuleService.GetModules = async () => {
    const repoModules = await ModuleRepo.readModules()

    if (!repoModules) {
      throw HttpError.NOT_FOUND('Modules not found.')
    }

    return repoModules.map(ModuleServiceUtils.createModuleFromRepo)
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

    if (!repoModules) {
      throw HttpError.NOT_FOUND('Modules not found.')
    }

    return repoModules.map(ModuleServiceUtils.createModuleFromRepo)
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

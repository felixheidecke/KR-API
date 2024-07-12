import knex from '../../libs/knex.js'

export namespace ModuleRepo {
  export type Module = {
    id: number
    name: string
    type: string
    url: string | null
    customer: number
  }
}

export class ModuleRepo {
  /**
   * Checks if a module exists in the repository.
   * @param id - The ID of the module.
   * @param type - The type of the module.
   * @returns A boolean indicating whether the module exists or not.
   */
  static async moduleExists(id: number, type?: string) {
    try {
      const moduleQuery = knex.select('_id').from('Module').where({ _id: id })

      if (type) {
        moduleQuery.andWhere({ type })
      }

      return !!(await moduleQuery.first())
    } catch (error) {
      console.error(error)
      throw new Error('SQL Error')
    }
  }

  /**
   * Reads a module from the database based on the provided ID and optional type.
   * @param id - The ID of the module to read.
   * @param type - Optional type of the module.
   * @returns The module entity if found, otherwise null.
   */
  static async readModule(id: number, type?: string): Promise<ModuleRepo.Module | null> {
    const moduleQuery = knex
      .select('_id as id', 'title as name', 'type', 'url', 'owner as customer')
      .from('Module')
      .where({ _id: id })

    if (type) {
      moduleQuery.andWhere({ type })
    }

    const module = await moduleQuery.first()

    return module || null
  }

  /**
   * Retrieves the list of modules from the database.
   * @returns A promise that resolves to an array of modules, or null if no modules are found.
   */
  static async readModules(): Promise<ModuleRepo.Module[]> {
    return await knex
      .select('_id as id', 'title as name', 'type', 'url', 'owner as customer')
      .from('Module')
  }

  /**
   * Retrieves modules by customer.
   * @param customer - The customer ID.
   * @returns A promise that resolves to an array of modules or null.
   */
  static async readModulesByClient(clientId: number): Promise<ModuleRepo.Module[]> {
    return await knex
      .select('_id as id', 'title as name', 'type', 'url', 'owner as customer')
      .from('Module')
      .where({ owner: clientId })
  }
}

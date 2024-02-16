import knex from '../../../services/knex.js'
import { Module } from '../entities/Module.js'

export type RepositoryModule = {
  id: number
  name: string
  type: string
  url: string | null
  customer: number
}

export class ModuleRepository {
  static async moduleExists(id: number, type?: string) {
    return !!(await this.readModule(id, type))
  }

  static async readModule(id: number, type?: string) {
    const moduleQuery = knex
      .select('_id as id', 'title as name', 'type', 'url', 'owner as customer')
      .from('Module')
      .where({ _id: id })

    if (type) {
      moduleQuery.andWhere({ type })
    }

    const module = await moduleQuery.first()

    return module ? toModuleEntity(id, module) : null
  }
}

function toModuleEntity(id: number, raw: RepositoryModule) {
  const module = new Module(id)
  module.name = raw.name
  module.type = raw.type
  module.customerId = raw.customer
  module.url = raw.url || ''

  return module
}

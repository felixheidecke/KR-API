import knex from '../../../services/knex.js'
import { Client } from '../entities/Client.js'
import { ModuleError } from '../../../common/decorators/Error.js'

export class ClientRepository {
  static async readOne(module: number) {
    try {
      const client = await knex
        .select('Customer._id', 'name', 'web', 'email', 'phone', 'address', 'zip', 'city')
        .from('Customer')
        .where('Module._id', module)
        .rightJoin('Module', 'Customer._id', '=', 'Module.owner')
        .first()

      return client._id ? toClientEntity(module, client) : null
    } catch (error) {
      console.error(error)
      throw new ModuleError('Could not read client')
    }
  }
}

// Helper functions

function toClientEntity(module: number, raw: any) {
  const client = new Client(module)

  client.name = raw.name
  client.web = raw.web
  client.email = raw.email
  client.phone = raw.phone
  client.address = raw.address
  client.zip = raw.zip
  client.city = raw.city

  return client
}

import knex from '../../modules/knex.js'

export type RepoClient = {
  id: number
  login: string
  superuser: 1 | 0
  lastLogin: number
}

export class ClientRepo {
  static async readClient(id: number): Promise<RepoClient | null> {
    const client = await knex('Customer')
      .select('_id as id', 'login', 'superuser', 'lastLogin')
      .where({ _id: id })
      .first()

    return client || null
  }

  /**
   * Retrieves a client by module.
   * @param module - The module number.
   * @returns A Promise that resolves to the client object if found, or null if not found.
   */
  static async readClientByModule(module: number): Promise<RepoClient | null> {
    const client = await knex
      .select('Customer._id as id', 'login', 'superuser', 'lastLogin')
      .from('Customer')
      .where('Module._id', module)
      .rightJoin('Module', 'Customer._id', '=', 'Module.owner')
      .first()

    return client || null
  }

  /**
   * Retrieves a customer by their API key hash.
   * @param hashedApiKey - The API key sha512/256 hash of the customer.
   * @returns A promise that resolves to the customer object if found, or null if not found.
   */
  public static async readClientByApiKey(hashedApiKey: string): Promise<RepoClient | null> {
    const client = await knex('ApiKey as ak')
      .select('c._id as id', 'c.login', 'c.superuser', 'c.lastLogin', 'ak.owner as client')
      .join('Customer as c', 'ak.owner', '=', 'c._id')
      .where('ak.key', hashedApiKey)
      .andWhere('ak.active', 1)
      .first()

    return client || null
  }
}

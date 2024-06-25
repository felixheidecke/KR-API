import knex from '../../modules/knex.js'

export namespace ApiKeyRepo {
  export type Key = {
    customerId: number
    key: string
  }
}

export class ApiKeyRepo {
  /**
   * Reads the active API keys from the database.
   * @returns A promise that resolves to an array of `RepoApiKeys` or `null` if no keys are found.
   */
  public static async readApiKeys(): Promise<ApiKeyRepo.Key[] | null> {
    return (await knex('ApiKey').select('key', 'owner as clientId').where({ active: 1 })) || null
  }
}

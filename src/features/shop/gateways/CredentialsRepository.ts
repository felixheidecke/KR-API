import knex from '../../../services/knex.js'

export type RepositoryPayPalCredentials = {
  clientId: string
  secret: string
}

export class CredentialsRepository {
  static async readPayPalCredentials(module: number): Promise<RepositoryPayPalCredentials | null> {
    const credentials = await knex('Shop3Credentials')
      .select('paypal_client_id as clientId', 'paypal_secret as secret')
      .where({ module })
      .first()

    return credentials || null
  }
}

import knex from '../../../modules/knex.js'

export type RepoPayPalCredentials = {
  clientId: string
  secret: string
}

export class CredentialsRepo {
  static async readPayPalCredentials(module: number): Promise<RepoPayPalCredentials | null> {
    const credentials = await knex('Shop3Credentials')
      .select('paypal_client_id as clientId', 'paypal_secret as secret')
      .where({ module })
      .first()

    return credentials || null
  }
}

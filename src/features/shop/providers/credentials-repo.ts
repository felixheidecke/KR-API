import knex from '#libs/knex.js'

export namespace CredentialsRepo {
  export type PayPalCredentials = {
    clientId: string
    secret: string
  }
}

export class CredentialsRepo {
  /**
   * Retrieves PayPal credentials for a specified module from the database.
   * @param {number} module - The identifier of the module to retrieve credentials for.
   * @returns {Promise<RepoPayPalCredentials|null>} A promise that resolves to the PayPal credentials if found, or null if no credentials are found.
   */
  static async readPayPalCredentials(
    module: number
  ): Promise<CredentialsRepo.PayPalCredentials | null> {
    const credentials = await knex('Shop3Credentials')
      .select('paypal_client_id as clientId', 'paypal_secret as secret')
      .where({ module })
      .first()

    return credentials || null
  }
}

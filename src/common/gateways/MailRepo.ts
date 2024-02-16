import knex from '../../modules/knex.js'

export type MailAddress = {
  email: string
  name: string
}

export class MailRepo {
  /**
   * Retrieves a mail address from the database based on the provided ID.
   * @param id - The ID of the mail address to retrieve.
   * @returns A Promise that resolves to the retrieved MailAddress object, or null if not found.
   */
  public static async readMailAddress(id: string | number): Promise<MailAddress | null> {
    return await knex('Formmail').select('email', 'name').where({ id }).first()
  }

  /**
   * Retrieves the email addresses and names of mail addresses based on the provided IDs.
   * @param ids - An array of IDs representing the mail addresses to retrieve.
   * @returns A Promise that resolves to an array of MailAddress objects or an empty array if no mail addresses are found.
   */
  public static async readMailAddresses(
    ids: Array<string | number>
  ): Promise<MailAddress[] | never[]> {
    return await knex('Formmail').select('email', 'name').whereIn('id', ids)
  }
}

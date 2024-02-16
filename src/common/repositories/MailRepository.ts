import knex from '../../services/knex.js'

type MailAddress = {
  email: string
  name: string
}

export class MailRepository {
  public static async readMailAddress(id: string | number): Promise<MailAddress | null> {
    return await knex('Formmail').select('email', 'name').where({ id }).first()
  }
  public static async readMailAddresses(
    ids: Array<string | number>
  ): Promise<MailAddress[] | never[]> {
    return await knex('Formmail').select('email', 'name').whereIn('id', ids)
  }
}

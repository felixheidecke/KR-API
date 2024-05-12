import knex from '../../../modules/knex.js'

export namespace CustomerRepo {
  export type Customer = {
    _id: number
    name: string
    web: string
    email: string
    phone: string
    address: string
    city: string
    zip: string
  }
}

export class CustomerRepo {
  public static async readCustomer(id: number): Promise<CustomerRepo.Customer | null> {
    const client = await knex
      .select('_id', 'name', 'web', 'email', 'phone', 'address', 'city', 'zip')
      .from('Customer')
      .where({ _id: id })
      .first()

    return client || null
  }

  public static async readCustomerByModule(module: number): Promise<CustomerRepo.Customer | null> {
    const client = await knex
      .select('c._id', 'c.name', 'c.web', 'c.email', 'c.phone', 'c.address', 'c.city', 'c.zip')
      .from('Customer as c')
      .leftJoin('Module as m', 'm.owner', 'c._id')
      .where('m._id', module)
      .first()

    return client || null
  }
}

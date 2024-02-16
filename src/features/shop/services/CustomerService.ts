import { HttpError } from '../../../common/decorators/Error.js'
import { Customer } from '../entities/Customer.js'
import { CustomerRepo, type RepoCustomer } from '../gateways/CustomerRepo.js'

export class CustomerService {
  public static async getCustomer(id: number, config: { shouldThrow?: boolean } = {}) {
    return await this._getCustomer(id, config.shouldThrow, 'id')
  }

  public static async getCustomerByModule(module: number, config: { shouldThrow?: boolean } = {}) {
    return await this._getCustomer(module, config.shouldThrow, 'module')
  }

  private static async _getCustomer(id: number, shouldThrow = false, by: 'id' | 'module') {
    let repoCustomer: RepoCustomer | null = null

    if (by === 'id') {
      repoCustomer = await await CustomerRepo.readCustomer(id)
    } else if (by === 'module') {
      repoCustomer = await await CustomerRepo.readCustomerByModule(id)
    }

    if (!repoCustomer && shouldThrow) {
      throw HttpError.NOT_FOUND('Customer not found.')
    }

    return repoCustomer ? this.utils.createCustomerFromRepo(repoCustomer) : null
  }

  public static get utils() {
    return {
      createCustomerFromRepo
    }
  }
}

// Utility functions

function createCustomerFromRepo(repoCustomer: RepoCustomer) {
  const customer = new Customer()

  customer.id = repoCustomer._id
  customer.name = repoCustomer.name
  customer.web = repoCustomer.web
  customer.email = repoCustomer.email
  customer.phone = repoCustomer.phone
  customer.address = repoCustomer.address
  customer.city = repoCustomer.city
  customer.zip = repoCustomer.zip

  return customer
}

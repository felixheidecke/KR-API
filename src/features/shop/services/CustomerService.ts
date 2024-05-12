import { HttpError } from '../../../common/decorators/Error.js'
import { Customer } from '../entities/Customer.js'
import { CustomerRepo } from '../gateways/CustomerRepo.js'

type BaseConfig = {
  shouldThrow?: boolean
}

export class CustomerService {
  public static async getCustomer(id: number, config: BaseConfig = {}) {
    const repoCustomer = await CustomerRepo.readCustomer(id)

    if (!repoCustomer && config.shouldThrow) {
      throw HttpError.NOT_FOUND('Customer not found.')
    }

    return repoCustomer ? this.createCustomerFromRepo(repoCustomer) : null
  }

  public static async getCustomerByModule(module: number, config: BaseConfig = {}) {
    const repoCustomer = await await CustomerRepo.readCustomerByModule(module)

    if (!repoCustomer && config.shouldThrow) {
      throw HttpError.NOT_FOUND('Customer not found.')
    }

    return repoCustomer ? this.createCustomerFromRepo(repoCustomer) : null
  }

  private static createCustomerFromRepo(repoCustomer: CustomerRepo.Customer) {
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
}

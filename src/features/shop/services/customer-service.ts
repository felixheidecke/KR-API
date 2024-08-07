import { HttpError } from '#utils/http-error.js'
import { Customer } from '../entities/customer.js'
import { CustomerRepo } from '../providers/customer-repo.js'

// --- [ Types ] -----------------------------------------------------------------------------------

type GetCustomerById = (id: number) => Promise<Customer>

type GetCustomerByModule = (module: number) => Promise<Customer>

// --- [ Class ] -----------------------------------------------------------------------------------

export class CustomerService {
  public static getCustomerById: GetCustomerById = async id => {
    const repoCustomer = await CustomerRepo.readCustomer(id)

    if (!repoCustomer) {
      throw HttpError.NOT_FOUND('Customer not found.')
    }

    return this.createCustomerFromRepo(repoCustomer)
  }

  public static getCustomerByModule: GetCustomerByModule = async (module: number) => {
    const repoCustomer = await CustomerRepo.readCustomerByModule(module)

    if (!repoCustomer) {
      throw HttpError.NOT_FOUND('Customer not found.')
    }

    return this.createCustomerFromRepo(repoCustomer)
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

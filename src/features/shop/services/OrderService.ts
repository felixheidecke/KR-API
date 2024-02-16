import { CustomerService } from './CustomerService.js'
import { getUnixTime } from 'date-fns'
import { HttpError } from '../../../common/decorators/Error.js'
import { Mail } from '../../../common/entities/Mail.js'
import { MailApi } from '../../../common/gateways/MailApi.js'
import { Order } from '../entities/Order.js'
import { OrderRepo } from '../gateways/OrderRepo.js'
import { TemplateRepo } from '../gateways/TemplateRepo.js'

import type { RepoOrder } from '../gateways/OrderRepo.js'
import type { Cart } from '../entities/Cart.js'
import type { Customer } from '../entities/Customer.js'

export class OrderService {
  /**
   * Retrieves an order based on module and transaction ID.
   *
   * @param {number} module - The module number.
   * @param {string} transactionId - The transaction ID of the order.
   * @returns {Promise<Order>} A promise that resolves to the retrieved order.
   * @throws {Error} If the module or transaction ID is missing, or if the order is not found.
   */

  public static async getOrder(
    module: number,
    transactionId: string,
    config: { shouldThrow?: boolean } = {}
  ): Promise<Order | null> {
    if (!module || !transactionId) {
      throw new Error('Module and/or transaction ID is missing.')
    }
    const order = await OrderRepo.getOrder(module, transactionId)

    if (!order && config.shouldThrow) {
      throw HttpError.NOT_FOUND('Order not found.')
    }

    return order ? createOrderFromRepo(order) : null
  }

  /**
   * Saves an order to the repo.
   *
   * @param {Order} order - The order object to be saved.
   * @throws {HttpError} If the order has invalid properties or cannot be saved.
   */

  public static async saveOrder(order: Order) {
    const { date, transactionId, isEmpty, address } = order

    if (date) {
      throw HttpError.BAD_REQUEST('Order already saved.')
    }

    if (isEmpty) {
      throw HttpError.BAD_REQUEST('Cart is empty.')
    }

    if (!address) {
      throw HttpError.BAD_REQUEST('Address is missing.')
    }

    if (!transactionId) {
      order.generateTransactionId()
    }

    order.generateDate()

    if (!(await OrderRepo.writeOrder(createRepoOrderFromOrder(order)))) {
      // Remove date if order could not be saved.
      order.date = null
    }
  }

  /**
   * Imports a cart into an order.
   *
   * @param {Order} order - The order to which the cart will be imported.
   * @param {Cart} cart - The cart to be imported.
   */

  public static async importCart(order: Order, cart: Cart) {
    order.cart = []
    order.total = cart.total
    order.shippingCost = cart.shipping

    cart.products.forEach(({ product, quantity, total }) => {
      order.addCartProduct({
        id: product.id,
        code: product.code || '',
        name: product.name || '',
        description: product.description || '',
        price: product.price || 0,
        quantity,
        total
      })
    })
  }

  /**
   * Updates the payment status of an order.
   *
   * @param {Order} order - The order for which to update the payment status.
   * @param {Order['paymentType']} paymentType - The type of payment.
   */

  public static async updatePaymentStatus(order: Order, paymentType: Order['paymentType']) {
    await OrderRepo.updateOrder(order, paymentType)
    order.paymentType = paymentType
  }

  /**
   * Sends an order confirmation mail.
   *
   * @param {Order} order - The order for which the confirmation mail will be sent.
   * @param {string} origin - The origin URL from where the request is made.
   * @throws {HttpError} If the order has no transaction ID or if the client/mail template cannot be loaded.
   * @returns {Promise<any>} A promise that resolves to the result of sending the mail.
   */

  public static async sendOrderConfirmationMail(order: Order, origin: string) {
    const { module, transactionId } = order

    if (!transactionId || !module) {
      throw HttpError.BAD_REQUEST('Order has no transaction ID.')
    }

    const mail = new Mail()
    const [client, mailTemplate] = await Promise.all([
      this._getCustomer(module),
      this._getMailTemplate(origin)
    ])

    mail.from = `${client.name} <${client.email}>`
    mail.subject = `Ihre Bestellung bei ${new URL(origin).hostname} (${order.transactionId?.toUpperCase()})`
    mail.body = mailTemplate({
      ...order.display(),
      date: (order.date as Date).toLocaleString('de-DE'),
      origin,
      owner: client,
      cart: order
        .display()
        .cart.map(item => `${item.quantity}x ${item.name} (${item.total.formatted})`)
    })

    mail.addTo(order.address.email as string, order.address.firstname + ' ' + order.address.name)
    mail.addTo(client.email as string, client.name as string, 'bcc')

    await MailApi.send(mail)
  }

  private static async _getCustomer(module: number): Promise<Customer> {
    const getCustomer = CustomerService.getCustomerByModule(module, { shouldThrow: true })

    try {
      return (await getCustomer) as Customer
    } catch (error) {
      throw new Error('Invalid client.')
    }
  }

  /**
   * Retrieves the mail template for order confirmation.
   *
   * @param {string} origin - The origin URL for the mail template.
   * @throws {Error} If the mail template cannot be loaded.
   * @returns {Promise<Function>} A promise that resolves to the mail template function.
   * @private
   * @static
   */

  private static async _getMailTemplate(origin: string) {
    const mailTemplate = await TemplateRepo.readTemplate('order-confirmation-mail.txt', origin)

    if (!mailTemplate) {
      throw new Error('Mail template not found.')
    }

    return mailTemplate || null
  }

  static get utils() {
    return {
      createRepoOrderFromOrder,
      createOrderFromRepo
    }
  }
}

function createRepoOrderFromOrder(order: Order): Omit<RepoOrder, '_id'> {
  return {
    module: order.module,
    date: getUnixTime(order.date as Date),
    transactionId: order.transactionId,
    payment: order.paymentType,
    amount: order.total,
    shipmentName: order.deliveryAddress.name || '',
    shipmentAddress: order.deliveryAddress.address || '',
    shipmentZip: order.deliveryAddress.zip || '',
    shipmentCity: order.deliveryAddress.city || '',
    shipmentCompany: order.deliveryAddress.company || '',
    shipmentPhone: order.deliveryAddress.phone || '',
    name: order.address.name || '',
    address: order.address.address || '',
    zip: order.address.zip || '',
    city: order.address.city || '',
    company: order.address.company || '',
    phone: order.address.phone || '',
    salutation: order.address.salutation || 'Herr',
    firstname: order.address.firstname || '',
    email: order.address.email || '',
    message: order.message || '',
    discount: 0,
    order: {
      cart: order.cart.map(item => ({
        productId: String(item.id),
        productCode: item.code,
        productName: item.name,
        productDescription: item.description,
        price: String(item.price),
        count: item.quantity,
        sum: item.total
      })),
      shipping: order.shippingCost,
      discountValue: 0
    }
  }
}

function createOrderFromRepo(repoOrder: RepoOrder): Order {
  const order = new Order(repoOrder.module)

  order.total = repoOrder.amount
  order.message = repoOrder.message
  order.transactionId = repoOrder.transactionId
  order.paymentType = repoOrder.payment
  order.address = {
    company: repoOrder.company,
    salutation: repoOrder.salutation,
    firstname: repoOrder.firstname,
    name: repoOrder.name,
    address: repoOrder.address,
    zip: repoOrder.zip,
    city: repoOrder.city,
    email: repoOrder.email,
    phone: repoOrder.phone
  }
  order.deliveryAddress = {
    name: repoOrder.shipmentName,
    address: repoOrder.shipmentAddress,
    zip: repoOrder.shipmentZip,
    city: repoOrder.shipmentCity,
    company: repoOrder.shipmentCompany,
    phone: repoOrder.shipmentPhone
  }
  order.date = repoOrder.date
  order.shippingCost = repoOrder.order.shipping

  repoOrder.order.cart.forEach(product => {
    order.addCartProduct({
      id: +product.productId,
      code: product.productCode,
      description: product.productDescription,
      name: product.productName,
      price: +product.price,
      quantity: product.count,
      total: product.sum
    })
  })

  return order
}

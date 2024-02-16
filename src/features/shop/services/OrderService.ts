import { ClientRepository } from '../gateways/ClientRepository.js'
import { ErrorCodes, ModuleError } from '../../../common/decorators/Error.js'
import { Mail } from '../../../common/entities/Mail.js'
import { MailApi } from '../../../common/repositories/MailApi.js'
import { OrderRepository } from '../gateways/OrderRepository.js'
import { TemplateRepository } from '../gateways/TemplateRepository.js'

import type { Cart } from '../entities/Cart.js'
import type { Order } from '../entities/Order.js'

export class OrderService {
  /**
   * Retrieves an order based on module and transaction ID.
   *
   * @param {number} module - The module number.
   * @param {string} transactionId - The transaction ID of the order.
   * @returns {Promise<Order>} A promise that resolves to the retrieved order.
   * @throws {ModuleError} If the module or transaction ID is missing, or if the order is not found.
   */

  public static async getOrder(module: number, transactionId: string) {
    if (!module || !transactionId) {
      throw new ModuleError('Module and/or transaction ID is missing.')
    }

    const order = await OrderRepository.getOrder(module, transactionId)

    if (!order) {
      throw new ModuleError(`Order ${transactionId} not found.`, ErrorCodes.IS_NULL)
    }

    return order
  }

  /**
   * Saves an order to the repository.
   *
   * @param {Order} order - The order object to be saved.
   * @throws {ModuleError} If the order has invalid properties or cannot be saved.
   */

  public static async saveOrder(order: Order) {
    const { date, transactionId, isEmpty, address } = order

    if (date) {
      throw new ModuleError('Order already saved.', ErrorCodes.BAD_REQUEST)
    }

    if (isEmpty) {
      throw new ModuleError('Cart is empty.', ErrorCodes.BAD_REQUEST)
    }

    if (!address) {
      throw new ModuleError('Address is missing.', ErrorCodes.VALIDATION_ERROR)
    }

    if (!transactionId) {
      order.generateTransactionId()
    }

    order.generateDate()

    if (!(await OrderRepository.writeOrder(order))) {
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
    await OrderRepository.updateOrder(order, paymentType)
    order.paymentType = paymentType
  }

  /**
   * Sends an order confirmation mail.
   *
   * @param {Order} order - The order for which the confirmation mail will be sent.
   * @param {string} origin - The origin URL from where the request is made.
   * @throws {ModuleError} If the order has no transaction ID or if the client/mail template cannot be loaded.
   * @returns {Promise<any>} A promise that resolves to the result of sending the mail.
   */

  public static async sendOrderConfirmationMail(order: Order, origin: string) {
    const { module, transactionId } = order

    if (!transactionId || !module) {
      throw new ModuleError('Order has no transaction ID.', ErrorCodes.VALIDATION_ERROR)
    }

    const client = await OrderService.getClient(module)
    const mailTemplate = await OrderService.getMailTemplate(origin)
    const mail = new Mail()
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

    return await MailApi.send(mail)
  }

  /**
   * Retrieves client information based on the module number.
   *
   * @param {number} module - The module number.
   * @throws {ModuleError} If the client cannot be loaded.
   * @returns {Promise<any>} A promise that resolves to the client information.
   * @private
   * @static
   */

  private static async getClient(module: number) {
    const client = await ClientRepository.readOne(module)

    if (!client) {
      throw new ModuleError('Could not load client.')
    }

    return client
  }

  /**
   * Retrieves the mail template for order confirmation.
   *
   * @param {string} origin - The origin URL for the mail template.
   * @throws {ModuleError} If the mail template cannot be loaded.
   * @returns {Promise<Function>} A promise that resolves to the mail template function.
   * @private
   * @static
   */

  private static async getMailTemplate(origin: string) {
    const mailTemplate = await TemplateRepository.getTemplate('order-confirmation-mail.txt', origin)

    if (!mailTemplate) {
      throw new ModuleError('Could not load mail template.')
    }

    return mailTemplate
  }
}

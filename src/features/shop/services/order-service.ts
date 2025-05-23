import { CustomerService } from './customer-service.js'
import { getUnixTime } from 'date-fns'
import { HttpError } from '#utils/http-error.js'
import { LOCALE } from '#utils/constants.js'
import { Mail } from '#common/entities/mail.js'
import { ModuleRepo } from '#common/providers/module-repo.js'
import { Order } from '../entities/order.js'
import { OrderRepo } from '../providers/order-repo.js'
import { SendMailerApi } from '#common/providers/send-mailer-api.js'
import { TemplateRepo } from '../providers/template-repo.js'

import type { Cart } from '../entities/cart.js'
import type { Customer } from '../entities/customer.js'

// --- [ Types ] -----------------------------------------------------------------------------------

type BaseConfig = {
  skipModuleCheck?: boolean
}

export namespace OrderService {
  export type GetOrderByTransaction = (
    module: number,
    transactionId: string,
    config?: BaseConfig
  ) => Promise<Order>

  export type SaveOrder = (order: Order) => Promise<void>

  export type ImportCart = (order: Order, cart: Cart) => void

  export type UpdatePaymentStatus = (
    order: Order,
    paymentType: Order['paymentType']
  ) => Promise<void>

  export type SendOrderConfirmationMail = (order: Order, origin: string) => Promise<any>
}

// --- [ Class ] -----------------------------------------------------------------------------------

export class OrderService {
  /**
   * Retrieves an order based on module and transaction ID.
   *
   * @param {number} module - The module number.
   * @param {string} transactionId - The transaction ID of the order.
   * @returns {Promise<Order>} A promise that resolves to the retrieved order.
   * @throws {Error} If the module or transaction ID is missing, or if the order is not found.
   */

  public static getOrderByTransaction: OrderService.GetOrderByTransaction = async (
    module,
    transactionId,
    { skipModuleCheck } = {}
  ) => {
    const [moduleExists, repoOrder] = await Promise.all([
      skipModuleCheck ? ModuleRepo.moduleExists(module) : Promise.resolve(true),
      OrderRepo.getOrder(module, transactionId)
    ])

    if (!moduleExists) {
      throw HttpError.NOT_FOUND('Module not found')
    }

    if (!repoOrder) {
      throw HttpError.NOT_FOUND('Order not found')
    }

    return this.createOrderFromRepo(repoOrder)
  }

  /**
   * Generate and set transaction ID on the order.
   * Generate and set date on the order.
   * Saves order to the repo.
   *
   * @param {Order} order - The order object to be saved.
   * @throws {HttpError} If the order has invalid properties or cannot be saved.
   */

  public static saveOrder: OrderService.SaveOrder = async order => {
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

    if (!(await OrderRepo.writeOrder(this.createRepoOrderFromOrder(order)))) {
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

  public static importCart: OrderService.ImportCart = (order, cart) => {
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

  public static updatePaymentStatus: OrderService.UpdatePaymentStatus = async (
    order,
    paymentType
  ) => {
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

    if (!transactionId) {
      throw HttpError.BAD_REQUEST('Missing transaction ID')
    }

    const mail = new Mail()
    const [client, mailTemplate] = await Promise.all([
      CustomerService.getCustomerByModule(module),
      this.getMailTemplate(origin)
    ])

    mail.from = `${client.name} <${client.email}>`
    mail.subject = `Ihre Bestellung bei ${new URL(origin).hostname} (${(order.transactionId as string)?.toUpperCase()})`
    mail.body = mailTemplate({
      ...order.display(),
      date: (order.date as Date).toLocaleString(LOCALE),
      origin,
      owner: client,
      cart: order
        .display()
        .cart.map(item => `${item.quantity}x ${item.name} (${item.total.formatted})`)
    })

    mail.addTo(order.address.email as string, order.address.firstname + ' ' + order.address.name)
    mail.addTo(client.email as string, client.name as string, 'bcc')

    return await SendMailerApi.send(mail)
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

  private static async getMailTemplate(origin: string) {
    const mailTemplate = await TemplateRepo.readTemplate('order-confirmation-mail.txt', origin)

    if (!mailTemplate) {
      throw new Error('Mail template not found.')
    }

    return mailTemplate || null
  }

  private static createRepoOrderFromOrder(order: Order): Omit<OrderRepo.Order, '_id'> {
    return {
      module: order.module,
      date: getUnixTime(order.date as Date),
      transactionId: order.transactionId as string,
      payment: order.paymentType,
      amount: order.total,
      shipmentName: order.deliveryAddress?.name || '',
      shipmentAddress: order.deliveryAddress?.address || '',
      shipmentZip: order.deliveryAddress?.zip || '',
      shipmentCity: order.deliveryAddress?.city || '',
      shipmentCompany: order.deliveryAddress?.company || '',
      shipmentPhone: order.deliveryAddress?.phone || '',
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

  private static createOrderFromRepo(repoOrder: OrderRepo.Order): Order {
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
}

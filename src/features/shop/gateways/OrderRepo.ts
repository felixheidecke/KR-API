import knex from '../../../modules/knex.js'
import { Order } from '../entities/Order.js'

export type RepoOrder = {
  _id: number
  module: number
  date: number
  payment: 'paypal' | 'prepayment'
  transactionId: string
  message: string
  company: string
  salutation: string
  name: string
  firstname: string
  address: string
  zip: string
  city: string
  phone: string
  email: string
  shipmentName: string
  shipmentAddress: string
  shipmentZip: string
  shipmentCity: string
  shipmentCompany: string
  shipmentPhone: string
  amount: number
  discount: 0
  order: {
    cart: {
      productId: string
      productCode: string
      productName: string
      productDescription: string
      price: string
      count: number
      sum: number
    }[]
    shipping: number
    discountValue: number
  }
}

export class OrderRepo {
  public static async getOrder(module: number, transactionId: string): Promise<RepoOrder | null> {
    const repoOrder = await knex('Shop3Order')
      .where({ module, transactionId } as any)
      .first()

    return repoOrder
      ? {
          ...repoOrder,
          order: JSON.parse(repoOrder.order)
        }
      : null
  }

  public static async writeOrder(repoOrder: Omit<RepoOrder, '_id'>) {
    await knex
      .insert({
        ...repoOrder,
        order: JSON.stringify(repoOrder.order)
      })
      .into('Shop3Order')

    return true
  }

  public static async updateOrder(order: Order, paymentType: RepoOrder['payment']) {
    try {
      await knex('Shop3Order')
        .update({ payment: paymentType })
        .where({ transactionId: order.transactionId })
    } catch (error) {
      console.error(error)
      throw new Error('Error updating order')
    }
  }
}

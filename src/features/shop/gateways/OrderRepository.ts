import { getUnixTime } from 'date-fns'
import knex from '../../../services/knex.js'
import { Order } from '../entities/Order.js'
import { ErrorCodes, ModuleError } from '../../../common/decorators/Error.js'

export type RawOrder = {
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

export class OrderRepository {
  public static async getOrder(module: number, transactionId: string) {
    const order = await knex('Shop3Order')
      .where({ module, transactionId } as any)
      .first()

    return order
      ? mapToNewOrder({
          ...order,
          order: JSON.parse(order.order)
        })
      : null
  }

  public static async writeOrder(order: Order) {
    const rawOrder = fromEntity(order)

    await knex
      .insert({
        ...rawOrder,
        discount: 0,
        order: rawOrder.order
      })
      .into('Shop3Order')

    return true
  }

  public static async updateOrder(order: Order, paymentType: RawOrder['payment']) {
    try {
      await knex('Shop3Order')
        .update({ payment: paymentType })
        .where({ transactionId: order.transactionId })
    } catch (error) {
      console.error(error)
      throw new ModuleError('Error updating order', ErrorCodes.INTERNAL_SERVER_ERROR)
    }
  }
}

function mapToNewOrder(raw: RawOrder) {
  const order = new Order(raw.module)
  order.total = raw.amount
  order.message = raw.message
  order.transactionId = raw.transactionId
  order.paymentType = raw.payment
  order.address = {
    company: raw.company,
    salutation: raw.salutation as 'Herr' | 'Frau', // We know it's "Herr" | "Frau"
    firstname: raw.firstname,
    name: raw.name,
    address: raw.address,
    zip: raw.zip,
    city: raw.city,
    email: raw.email,
    phone: raw.phone
  }
  order.deliveryAddress = {
    name: raw.shipmentName,
    address: raw.shipmentAddress,
    zip: raw.shipmentZip,
    city: raw.shipmentCity,
    company: raw.shipmentCompany,
    phone: raw.shipmentPhone
  }
  order.date = raw.date
  order.shippingCost = raw.order.shipping

  raw.order.cart.forEach(product => {
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

function fromEntity(order: Order) {
  const database = {
    module: order.module,
    date: order.date ? getUnixTime(order.date) : undefined,
    transactionId: order.transactionId,
    payment: order.paymentType,
    amount: order.total,
    shipmentName: order.deliveryAddress.name,
    shipmentAddress: order.deliveryAddress.address,
    shipmentZip: order.deliveryAddress.zip,
    shipmentCity: order.deliveryAddress.city,
    shipmentCompany: order.deliveryAddress.company,
    shipmentPhone: order.deliveryAddress.phone,
    name: order.address.name,
    address: order.address.address,
    zip: order.address.zip,
    city: order.address.city,
    company: order.address.company,
    phone: order.address.phone,
    salutation: order.address.salutation,
    firstname: order.address.firstname,
    email: order.address.email,
    message: order.message,
    order: JSON.stringify({
      cart: order.cart.map(({ id, code, name, description, price, quantity, total }) => ({
        productId: id,
        productCode: code,
        productName: name,
        productDescription: description,
        price: price,
        count: quantity,
        sum: total
      })),
      shipping: order.shippingCost,
      discountValue: 0
    })
  }

  return database
}

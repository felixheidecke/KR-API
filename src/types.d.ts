import type HttpError from '#decorators/http-error.js'
import type Client from '#common/entities/client.entity.ts'
import type Module from '#common/entities/module.entity.ts'
import type Cart from '#features/shop/entities/cart.entity.ts'
import type Order from '#features/shop/entities/order.entity.ts'
import type PayPal from '#features/shop/entities/paypal.entity.ts'

declare module 'fastify' {
  export interface FastifyRequest {
    data: any
    client: Client
  }

  export interface Session {
    cart: Cart
    order: Order
    paypal: PayPal
  }
}

export type Prettify<T> = {
  [K in keyof T]: T[K]
} & {}

import type Client from './common/entities/Client.ts'
import type Module from './common/entities/Module.ts'
import type Cart from './features/shop/entities/Cart.ts'
import type Order from './features/shop/entities/Order.ts'
import type PayPal from './features/shop/entities/PayPal.ts'
import type useRedis from './modules/redis.ts'

declare module 'fastify' {
  export interface FastifyRequest {
    data: any
  }

  export interface Session {
    cart: Cart
    order: Order
    paypal: PayPal
    client?: Client
  }
}

declare module 'textile-js' {
  export function format(text: string): string
}

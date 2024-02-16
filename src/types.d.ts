import type Cart from './features/shop/entities/Cart.ts'
import type Order from './features/shop/entities/Order.ts'
import type PayPal from './features/shop/entities/PayPal.ts'
import type { CartService } from './features/shop/services/__CartInteractor.ts'
import type useRedis from './services/redis.js'

declare module 'fastify' {
  export interface FastifyInstance {
    redis: ReturnType<typeof useRedis>
  }

  export interface FastifyRequest {
    data: any
  }

  export interface Session {
    cart: Cart
    order: Order
    paypal: PayPal
  }
}

declare module 'textile-js' {
  export function format(text: string): string
}

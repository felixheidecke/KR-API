import { randomUUID } from 'crypto'
import { toMilliseconds } from '#utils/convert-time.js'
import type { FastifyInstance } from 'fastify'

export default function shop(App: FastifyInstance, _: { prefix: string }, done: Function) {
  App
    // Plugins
    .register(import('@fastify/cookie'))
    .register(import('@fastify/session'), {
      secret: randomUUID(),
      cookie: {
        sameSite: 'none',
        maxAge: toMilliseconds({ minutes: 5 })
      }
    })
    .register(import('#plugins/authentication/index.js'), {
      authorize: ({ client, params }) => {
        const { module } = params as { module?: string }

        return !module ? false : client.hasModuleAccess(+module)
      }
    })

    // Routes
    .register(import('./controller/info-controller.js'))
    .register(import('./controller/cart-controller.js'))
    .register(import('./controller/group-controller.js'))
    .register(import('./controller/order-controller.js'))
    .register(import('./controller/products-controller.js'))
    .register(import('./controller/payment-controller.js'))

  done()
}

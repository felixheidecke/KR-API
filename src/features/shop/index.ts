import { randomUUID } from 'crypto'
import { toMilliseconds } from '../../common/utils/convert-time.js'
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
    .register(import('../../common/plugins/authentication/index.js'), {
      authorize: ({ client, params }) => client.hasModuleAccess((params as any).module)
    })

    // Routes
    .register(import('./controller/CartController.js'))
    .register(import('./controller/GroupController.js'))
    .register(import('./controller/OrderController.js'))
    .register(import('./controller/ProductsController.js'))
    .register(import('./controller/PaymentController.js'))

  done()
}

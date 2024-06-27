import { randomUUID } from 'crypto'
import { toMilliseconds } from '../../common/utils/convert-time.js'

export default function shop(App, _, done) {
  App.register(import('../../common/plugins/authorization.js'), {
    authorize: ['module-match']
  })

  App.register(import('@fastify/cookie'))

  App.register(import('@fastify/session'), {
    secret: randomUUID(),
    cookie: {
      sameSite: 'none',
      maxAge: toMilliseconds({ minutes: 5 }),
      cookieName: 'shopSessionId',
    }
  })

  App.register(import('./controller/CartController.js'))
  App.register(import('./controller/GroupController.js'))
  App.register(import('./controller/OrderController.js'))
  App.register(import('./controller/ProductsController.js'))
  App.register(import('./controller/PaymentController.js'))

  done()
}

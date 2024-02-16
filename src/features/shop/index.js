import { toMilliseconds } from '../../common/utils/convert-time.js'

export default function shop(App, _, done) {
  // Plugins
  App.register(import('@fastify/cookie'))

  App.register(import('@fastify/session'), {
    secret: process.env.APP_SECRET,
    path: '/shop',
    cookie: { sameSite: 'None' },
    cookieName: 'shopSession',
    maxAge: toMilliseconds({ minutes: 10 })
  })

  // Hooks
  //App.addHook('onRequest', authOrigin)
  // App.addHook('onRequest', cleanSession)

  // Controller
  App.register(import('./controller/CartController.js'))
  App.register(import('./controller/CategoryController.js'))
  // App.register(import('./controller/InfoController.js'))
  App.register(import('./controller/OrderController.js'))
  App.register(import('./controller/ProductsController.js'))
  App.register(import('./controller/PaymentController.js'))

  done()
}

import '#env'
import App from '#libs/fastify'
import notFoundHandler from './decorators/notFoundHandler.js'
import clientErrorHandler from './decorators/clientErrorHandler.js'
import catchHandler from './decorators/catchHandler.js'
import { messageHook } from '#hooks/headerHooks'
import { host, port, secret } from '#config/app.config'
import { COOKIE_NAME } from './constants.js'

// Hooks
App.addHook('onRequest', messageHook)

// Decodators
App.decorate('catchHandler', catchHandler)
App.decorate('clientErrorHandler', clientErrorHandler)
App.decorate('notFoundHandler', notFoundHandler)

// Handling CORS
App.register(import('@fastify/cors'), {
  methods: ['GET', 'POST', 'DELETE'],
  credentials: true,
  origin: true
})

App.register(import('@fastify/cookie'), {
  hook: 'onRequest'
})

// Register controller
App.register(import('#controller/articleController'))
App.register(import('#controller/eventController'))
App.register(import('#controller/galleryController'))
App.register(import('#controller/invalidateCacheController'))
App.register(import('#controller/menuCardController'))
App.register(import('#controller/pingController'))
App.register(import('#controller/formController'))

/**
 * Xioni Shop Controller
 */

App.register(async function ({ register }) {
  register(import('@fastify/session'), {
    secret,
    cookie: { sameSite: 'None' },
    cookieName: COOKIE_NAME('shopSessionId'),
    maxAge: 1800000 // 30 min.
  })

  register(import('#controller/shop/shopCartController'))
  register(import('#controller/shop/shopOrderController'))
  register(import('#controller/shop/shopCategoryController'))
  register(import('#controller/shop/shopProductsController'))
  register(import('#controller/shop/shopInfoController'))
})

// Startup
;(async () => {
  try {
    await App.listen({ port, host })
  } catch (err) {
    App.log.error({ err })
    process.exit(1)
  }
})()

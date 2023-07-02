import '#env'
import App from '#libs/fastify'
import { host, port } from '#config/app.config'
import { messageHook } from '#hooks/headerHooks'
import notFoundHandler from './decorators/notFoundHandler.js'
import catchHandler from './decorators/catchHandler.js'
import clientErrorHandler from './decorators/clientErrorHandler.js'

// Hooks
App.addHook('onRequest', messageHook)

// Decodators
App.decorate('catchHandler', catchHandler)
App.decorate('clientErrorHandler', clientErrorHandler)
App.decorate('notFoundHandler', notFoundHandler)

// Handling CORS
App.register(import('@fastify/cors'), {
  methods: ['GET', 'POST', 'DELETE'],
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

App.register(import('#controller/shop/shopController'))

// Startup
;(async () => {
  try {
    await App.listen({ port, host })
  } catch (err) {
    App.log.error({ err })
    process.exit(1)
  }
})()

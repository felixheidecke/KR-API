import '#env'
import App from '#libs/fastify'
import { host, port } from '#config/app.config'
import { messageHook } from '#hooks/headerHooks'
import notFoundHandler from './decorators/notFoundHandler.js'
import catchHandler from './decorators/catchHandler.js'

// Hooks
App.addHook('onRequest', messageHook)

// Decodators
App.decorate('catchHandler', catchHandler)
App.decorate('notFoundHandler', notFoundHandler)

// Handling CORS
App.register(import('@fastify/cors'), {
  methods: ['GET', 'POST', 'PATCH'],
  origin: true
})

App.register(import('@fastify/cookie'), {
  hook: 'onRequest'
})

// Register routes
App.register(import('./router.js'))

// Startup
;(async () => {
  try {
    await App.listen({ port, host })
  } catch (err) {
    App.log.error({ err })
    process.exit(1)
  }
})()

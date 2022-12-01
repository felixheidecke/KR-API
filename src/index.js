import '#env'
import { host, port } from '#config/app'
import { message as messageHeader } from '#hooks/header'
import App from '#libs/fastify'

// Global Hooks
App.addHook('onRequest', messageHeader)

// Handling CORS
App.register(import('@fastify/cors'), {
  methods: ['GET', 'POST', 'PATCH'],
  // credentials: true,
  origin: true
})

App.register(import('@fastify/cookie'), {
  hook: 'onRequest'
})

// Register routes
App.register(import('#routes/article'))
App.register(import('#routes/event'))
App.register(import('#routes/flush'))
App.register(import('#routes/form'))
App.register(import('#routes/gallery'))
App.register(import('#routes/menu-card'))
App.register(import('#routes/ping'))
App.register(import('#routes/shop-cart'))
App.register(import('#routes/shop-category'))
// App.register(import('#routes/shop-info'))
App.register(import('#routes/shop-product'))

// Startup
;(async () => {
  try {
    await App.listen({ port, host })
  } catch (err) {
    App.log.error({ err })
    process.exit(1)
  }
})()

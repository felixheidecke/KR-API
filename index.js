import '#utils/env'

import { host, port } from '#config/app'
import { message as messageHeader } from '#hooks/header'
import App from '#libs/fastify'

// Global Hooks
App.addHook('onRequest', messageHeader)

// Handling CORS
App.register(import('@fastify/cors'), {
  methods: ['GET', 'POST'],
  origin: '*'
})

// App.register(import('@fastify/cookie'), {
//   hook: 'onRequest'
// })

// Register routes
App.register(import('#routes/article'))
App.register(import('#routes/articles'))
App.register(import('#routes/event'))
App.register(import('#routes/events'))
App.register(import('#routes/form'))
App.register(import('#routes/menu-card'))
App.register(import('#routes/ping'))
App.register(import('#routes/flush'))

App.register(import('./routes/gallery.routes.js'))
App.register(import('./routes/shop-product.routes.js'))
App.register(import('./routes/shop-category.routes.js'))
App.register(import('./routes/shop-cart.routes.js'))
App.register(import('./routes/shop-info.routes.js'))

// Startup
;(async () => {
  try {
    await App.listen({ port, host })
  } catch (err) {
    App.log.error({ err })
    process.exit(1)
  }
})()

import '#utils/env'

import { host, port } from '#config/app.config'
import baseHeader from '#hooks/base-header'
import App from '#libs/fastify'

// Global Hooks
App.addHook('onRequest', baseHeader)

// Handling CORS
App.register(import('@fastify/cors'), {
  methods: ['GET', 'POST'],
  origin: '*'
})

// Register routes
App.register(import('#routes/article.route'))
App.register(import('#routes/articles.route'))
App.register(import('#routes/event.route'))
App.register(import('#routes/events.route'))
App.register(import('#routes/form.route'))
App.register(import('#routes/menu-card.route'))
App.register(import('#routes/ping.route'))

// Startup
;(async () => {
  try {
    await App.listen({ port, host })
  } catch (err) {
    App.log.error({ err })
    process.exit(1)
  }
})()

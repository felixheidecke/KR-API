import '#env'
import { host, port } from '#config/app'
import { message as messageHeader } from '#hooks/header'
import App from '#libs/fastify'

// Global Hooks
App.addHook('onRequest', messageHeader)

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

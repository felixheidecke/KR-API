import '#env'
import { dsn as sentryDsn } from '#config/sentry.config'
import { host, port } from '#config/app.config'
import { messageHook } from '#hooks/headerHooks'
import * as Sentry from '@sentry/node'
import App from '#libs/fastify'
import catchHandler from './decorators/catchHandler.js'
import clientErrorHandler from './decorators/clientErrorHandler.js'
import notFoundHandler from './decorators/notFoundHandler.js'
import pkg from '../package.json' assert { type: 'json' }

if (sentryDsn) {
  Sentry.init({
    dsn: sentryDsn,
    initialScope: {
      tags: {
        app_version: pkg.version
      }
    }
  })
}

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

// --- [ Error Handler ] ---------------------------------------------------------------------------

App.setErrorHandler(function (error, _, reply) {
  const statusCode = 'statusCode' in error ? error.statusCode : 500
  const response = {
    message: error.message,
    payload: undefined
  }

  if ('payload' in error && error.payload) {
    response.payload = error.payload
  }

  reply.status(statusCode).send(response)
  Sentry.captureException(error)
})

// Startup
;(async () => {
  try {
    await App.listen({ port, host })
  } catch (error) {
    App.log.error({ error })
    Sentry.captureException(error)
    process.exit(1)
  }
})()

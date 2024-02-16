import './env.js'

import { defaultHeadersHook } from './common/hooks/headerHooks.js'
import { ModuleError, HttpError } from './common/decorators/Error.js'
import { ZodError } from 'zod'
import * as Sentry from '@sentry/node'
import App from './services/fastify.js'
import type { FastifyListenOptions } from 'fastify'

// --- [ Plugins ] ---------------------------------------------------------------------------------

Sentry.init({
  dsn: process.env.SENTRY_DSN || undefined
})

App.register(import('@fastify/cors'), {
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  credentials: true,
  origin: true
})

// --- [ Hooks ] -----------------------------------------------------------------------------------

App.addHook('onRequest', defaultHeadersHook)

// --- [ Controller ] ------------------------------------------------------------------------------

App.register(import('./controller/CacheController.js'))

// --- [ Features ] --------------------------------------------------------------------------------

App.register(import('./features/cms/index.js'), { prefix: 'cms' })
App.register(import('./features/form-mail/index.js'), { prefix: 'form-mail' })
App.register(import('./features/shop/index.js'), { prefix: 'shop' })

// --- [ Error Handler ] ---------------------------------------------------------------------------

App.setErrorHandler(function (error: HttpError | ModuleError | ZodError | Error, request, reply) {
  if (process.env.NODE_ENV === 'production') {
    const scope = new Sentry.Scope()

    scope.setTag('origin', request.headers.origin || 'unknown')
    scope.setContext('context', { url: request.url })
    Sentry.captureException(error, scope)
  } else {
    console.error(error)
  }

  let responseError: HttpError

  switch (error.name) {
    case 'ZodError':
      responseError = HttpError.fromZodError(error as ZodError)
      break
    case 'ModuleError':
      responseError = HttpError.fromModuleError(error as ModuleError)
      break
    case 'HttpError':
      responseError = error as HttpError
      break
    default:
      responseError = HttpError.fromError(error)
      break
  }

  reply.status(responseError.statusCode).send(responseError.response)
})

App.listen(
  {
    port: process.env.APP_PORT || 8300,
    host: process.env.APP_HOST || 'localhost'
  } as FastifyListenOptions,
  error => {
    if (!error) return

    Sentry.captureException(error)
    App.log.error(error)
    process.exit(1)
  }
)

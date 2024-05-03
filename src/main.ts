import './env.js'

import { defaultHeadersHook } from './common/hooks/headerHooks.js'
import { HttpError } from './common/decorators/Error.js'
import { randomUUID } from 'crypto'
import { toMilliseconds } from './common/utils/convert-time.js'
import { ZodError } from 'zod'
import fastify from './modules/fastify.js'
import knex from './modules/knex.js'
import sentry from './modules/sentry.js'

// --- [ Plugins ] --------------------------------------------------------------------------

fastify.register(import('@fastify/cors'), {
  credentials: true,
  origin: true
})

fastify.register(import('@fastify/cookie'))

fastify.register(import('@fastify/session'), {
  secret: randomUUID(),
  cookie: {
    sameSite: 'none',
    maxAge: toMilliseconds({ minutes: 5 })
  }
})

fastify.register(import('./common/plugins/authentication.js'))

fastify.addHook('onClose', async () => {
  await knex.destroy()
  fastify.log.info(`Server shutting down. Database connection destroyed. Bye! 👋🏼`)
})

// --- [ Headers ] ---------------------------------------------------------------------------------

fastify.addHook('onRequest', defaultHeadersHook)

// --- [ Features ] --------------------------------------------------------------------------------

fastify.register(import('./features/admin/index.js'), { prefix: 'admin' })
fastify.register(import('./features/cms/index.js'), { prefix: 'cms' })
fastify.register(import('./features/form-mail/index.js'), { prefix: 'form-mail' })
fastify.register(import('./features/shop/index.js'), { prefix: 'shop' })

// --- [ Error Handler ] ---------------------------------------------------------------------------

fastify.setErrorHandler(function (error: HttpError | ZodError | Error, request, reply) {
  if (sentry.isInitialized()) {
    const scope = new sentry.Scope()

    scope.setContext('context', { url: request.url })
    sentry.captureException(error, scope)
  } else {
    console.error(error)
  }

  let responseError: HttpError

  switch (error.name) {
    case 'ZodError':
      responseError = HttpError.fromZodError(error as ZodError)
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

export default fastify
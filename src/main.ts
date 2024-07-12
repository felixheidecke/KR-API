import './env.js'

import { HEADER, MIME_TYPE } from '#utils/constants.js'
import { ZodError } from 'zod'
import fastify from '#libs/fastify.js'
import knex from '#libs/knex.js'
import sentry from '#libs/sentry.js'
import packageJson from '#utils/package-json.js'

import type { FastifyReply } from 'fastify'
import { HttpError } from '#utils/http-error.js'

// --- [ Plugins ] ---------------------------------------------------------------------------------

fastify.register(import('@fastify/cors'), {
  credentials: true,
  origin: true
})

fastify.addHook('onClose', async () => {
  await knex.destroy()
  fastify.log.info(`Server shutting down. Database connection destroyed. Bye! 👋🏼`)
})

// --- [ Decorators ] ------------------------------------------------------------------------------

fastify.decorateRequest('httpError', HttpError)

// --- [ Headers ] ---------------------------------------------------------------------------------

fastify.addHook('onRequest', async (_: any, response: FastifyReply) => {
  response.headers({
    [HEADER.POWERED_BY]: 'Klickrhein.de | Ihre Webagentur im Rheingau',
    [HEADER.VERSION]: packageJson.version,
    [HEADER.CONTENT_TYPE]: MIME_TYPE.JSON
  })
})

// --- [ Features ] --------------------------------------------------------------------------------

fastify.register(import('./features/info/index.js'), { prefix: 'info' })
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

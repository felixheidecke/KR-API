import { HttpError } from '../decorators/Error.js'
import plugin from 'fastify-plugin'

import type { FastifyInstance, FastifyRequest } from 'fastify'

export default plugin(function (
  App: FastifyInstance,
  options: { credentials: string[] },
  done: Function
) {
  App.addHook('onRequest', ({ headers }: FastifyRequest, _: any, done: Function) => {
    if (!headers.authorization) {
      throw new HttpError('Unauthorized', 401)
    }

    if (!options.credentials.includes(headers.authorization)) {
      throw new HttpError('Forbidden', 403)
    }

    done()
  })

  done()
})

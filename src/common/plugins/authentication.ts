import { ClientService } from '../services/ClientService.js'
import { HttpError } from '../decorators/Error.js'
import plugin from 'fastify-plugin'

import type { FastifyInstance, FastifyRequest } from 'fastify'

export default plugin(function (App: FastifyInstance, _: never, done: Function) {
  App.addHook('onRequest', async ({ headers, session }: FastifyRequest, _) => {
    if (session.client) return

    if (!headers.apikey) {
      throw HttpError.UNAUTHORIZED('Unauthorized', 'Missing API key.')
    }

    const client = await new ClientService().getClientByApiKey(headers.apikey as string)

    if (!client) {
      throw HttpError.FORBIDDEN('Forbidden', 'Unknown API key.')
    }

    session.set('client', client)
  })

  done()
})

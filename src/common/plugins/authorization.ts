import plugin from 'fastify-plugin'
import { HttpError } from '../decorators/Error.js'
import { isArray, isFunction } from 'lodash-es'

import type { FastifyInstance, FastifyRequest } from 'fastify'
import type { InferFastifyRequest } from '../types/InferFastifyRequest.js'

type AuthorizationPluginOptions = {
  authorize: Array<'superuser' | 'module-match'> | Function
}

export default plugin(function (
  App: FastifyInstance,
  config: AuthorizationPluginOptions,
  done: Function
) {
  if (!config.authorize) {
    throw new Error('Missing AuthorizationPluginOptions')
  }

  if (isFunction(config.authorize)) {
    App.addHook('onRequest', config.authorize)
    done()
    return
  }

  if (isArray(config.authorize) && config.authorize.includes('module-match')) {
    App.addHook(
      'onRequest',
      async ({ params, session }: InferFastifyRequest<{ params: { module: string | number } }>) => {
        if (!params.module) {
          throw new Error('Module ID is required')
        }

        if (
          !(
            session.client?.authorizedModuleIds.includes(+params.module) ||
            session.client?.isSuperuser
          )
        ) {
          throw HttpError.FORBIDDEN()
        }
      }
    )
  }

  if (isArray(config.authorize) && config.authorize.includes('superuser')) {
    App.addHook('onRequest', async ({ session }: FastifyRequest) => {
      if (!session.client?.isSuperuser) {
        throw HttpError.FORBIDDEN()
      }
    })
  }

  done()
})

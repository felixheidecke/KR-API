import { isFunction } from 'lodash-es'
import moduleMatch from './src/checkModuleMatch.js'
import plugin from 'fastify-plugin'
import superuser from './src/checkIsSuperuser.js'

import type { FastifyInstance } from 'fastify'
import { AuthorizationPlugin } from './types.js'

export default plugin(
  function (App: FastifyInstance, config: AuthorizationPlugin.Config, done: Function) {
    if (isFunction(config.authorize)) {
      App.addHook('onRequest', config.authorize)
    }

    if (config.authorize === AuthorizationPlugin.Authorize.MODULE_MATCH) {
      App.addHook('onRequest', moduleMatch)
    }

    if (config.authorize === AuthorizationPlugin.Authorize.SUPERUSER) {
      App.addHook('onRequest', superuser)
    }

    done()
  },
  {
    name: 'authorization',
    dependencies: ['authentication']
  }
)

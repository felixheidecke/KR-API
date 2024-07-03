import plugin from 'fastify-plugin'
import User from '../../entities/User.js'
import validateApiKey from './src/validateApiKey.js'
import authenticateUser from './src/authenticateUser.js'

import type { FastifyInstance } from 'fastify'

export default plugin(
  function (App: FastifyInstance, _: never, done: Function) {
    App.decorateRequest('user', new User())
    App.addHook('onRequest', validateApiKey)
    App.addHook('onRequest', authenticateUser)
    done()
  },
  { name: 'authentication' }
)

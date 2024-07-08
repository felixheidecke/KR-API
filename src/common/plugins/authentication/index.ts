import apiKeyValidationHandler from './handler/apiKeyValidationHandler.js'
import Client from '../../entities/Client.js'
import plugin from 'fastify-plugin'
import userAuthenticationHandler from './handler/userAuthenticationHandler.js'

import type { FastifyInstance, FastifyRequest } from 'fastify'

type AuthorizeFunction = (request: FastifyRequest) => boolean

const setupAuthentication = (
  appInstance: FastifyInstance,
  config: {
    authorize: boolean | AuthorizeFunction
  },
  done: Function
) => {
  appInstance.decorateRequest('client', new Client(0))

  appInstance.addHook('onRequest', apiKeyValidationHandler)
  appInstance.addHook('onRequest', userAuthenticationHandler)
  appInstance.addHook('onRequest', async request => {
    const { authorize } = config

    if (authorize === false || (typeof authorize === 'function' && !authorize(request))) {
      throw new Error('Unauthorized')
    }

    return
  })

  done()
}

export default plugin(setupAuthentication, {
  name: 'authentication'
})

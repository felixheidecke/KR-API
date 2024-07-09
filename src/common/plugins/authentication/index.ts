import apiKeyValidationHandler from './handler/apiKeyValidationHandler.js'
import Client from '../../entities/Client.js'
import plugin from 'fastify-plugin'
import userAuthenticationHandler from './handler/userAuthenticationHandler.js'

import type { FastifyInstance, FastifyRequest } from 'fastify'
import { HttpError } from '../../decorators/Error.js'
import { isBoolean, isFunction } from 'lodash-es'

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

    if ((isBoolean(authorize) && !authorize) || (isFunction(authorize) && !authorize(request))) {
      throw HttpError.UNAUTHORIZED()
    }

    return
  })

  done()
}

export default plugin(setupAuthentication, {
  name: 'authentication'
})

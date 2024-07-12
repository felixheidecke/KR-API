import { isBoolean, isFunction } from 'lodash-es'
import apiKeyValidationHandler from './handler/api-key-validation-handler.js'
import Client from '#common/entities/client.js'
import { HttpError } from '#utils/http-error.js'
import plugin from 'fastify-plugin'
import type { FastifyInstance, FastifyRequest } from 'fastify'
import userAuthenticationHandler from './handler/user-authentication-handler.js'

type AuthorizeFunction = (request: FastifyRequest) => boolean

const setupAuthentication = (
  appInstance: FastifyInstance,
  config: {
    authorize: boolean | AuthorizeFunction
  },
  done: Function
) => {
  appInstance.decorateRequest('client', null as Client | null)

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

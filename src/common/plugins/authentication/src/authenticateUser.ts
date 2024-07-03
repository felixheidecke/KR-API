import { ClientService } from '../../../services/ClientService.js'
import { HttpError } from '../../../decorators/Error.js'
import { toMilliseconds } from '../../../utils/convert-time.js'
import User from '../../../entities/User.js'

import type { FastifyRequest } from 'fastify'

const keyUserStorage: Map<string, User> = new Map()

setInterval(() => keyUserStorage.clear(), toMilliseconds({ hours: 1 }))

export default async (request: FastifyRequest) => {
  const apiKey = request.headers['api-key'] as string

  if (keyUserStorage.has(apiKey)) {
    request.user = keyUserStorage.get(apiKey) as User

    request.log.info(`Serving User ${request.user.clientId} from cache`)
  } else {
    const client = await ClientService.getClientByApiKey(apiKey)

    if (!client) {
      throw HttpError.FORBIDDEN('Forbidden', 'Unknown API key.')
    }

    request.user = new User(client.id, client.authorizedModuleIds, client.isSuperuser)

    keyUserStorage.set(apiKey, request.user)
    request.log.info(`Serving User ${request.user.clientId} from database`)
  }
}

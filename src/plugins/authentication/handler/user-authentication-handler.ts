import { HttpError } from '#utils/http-error.js'
import { toMilliseconds } from '#utils/convert-time.js'
import { ClientService } from '#common/services/client-service.js'

import type { FastifyRequest } from 'fastify'
import type Client from '#common/entities/client.js'

const keyClientStorage: Map<string, Client> = new Map()

setInterval(() => keyClientStorage.clear(), toMilliseconds({ hours: 1 }))

export default async (request: FastifyRequest) => {
  const apiKey = request.headers['api-key'] as string

  // Fetch user from cache
  if (keyClientStorage.has(apiKey)) {
    request.client = keyClientStorage.get(apiKey) as Client
  }
  // Fetch user from database
  else {
    try {
      request.client = await ClientService.getClientByApiKey(apiKey)

      keyClientStorage.set(apiKey, request.client)
    } catch {
      throw HttpError.FORBIDDEN('Forbidden', 'Unknown API key.')
    }
  }
}

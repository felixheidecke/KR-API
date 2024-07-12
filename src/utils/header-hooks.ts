import { HEADER } from './constants.js'
import type { FastifyReply, FastifyRequest } from 'fastify'

export async function cacheControlNoStoreHandler(_: FastifyRequest, response: FastifyReply) {
  response.headers({
    [HEADER.CACHE_CONTROL]: [HEADER.PRIVATE, HEADER.NO_STORE].join(', ')
  })
}

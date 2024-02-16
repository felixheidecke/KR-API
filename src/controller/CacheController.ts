import type { FastifyInstance, FastifyReply } from 'fastify'
import { cacheHeadersNoStoreHook } from '../common/hooks/headerHooks.js'
import useRedis from '../services/redis.js'

export default async function (App: FastifyInstance) {
  App.addHook('onRequest', cacheHeadersNoStoreHook)

  App.delete('/cache', {
    handler: async (_, reply: FastifyReply) => {
      const redis = await useRedis()

      await redis.FLUSHALL()
      redis.disconnect()
      reply.code(204).send()
    }
  })
}

import useRedis from '../../../modules/redis.js'
import type { FastifyInstance, FastifyReply } from 'fastify'

export default async function (App: FastifyInstance) {
  App.delete('/cache', {
    handler: async (_, reply: FastifyReply) => {
      const redis = await useRedis()

      await redis.FLUSHALL()
      redis.disconnect()
      reply.code(204).send()
    }
  })
}

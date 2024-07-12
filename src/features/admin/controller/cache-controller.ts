import redis from '#libs/redis.js'
import type { FastifyInstance } from 'fastify'

export default async function CacheController(App: FastifyInstance) {
  App.delete('/cache', {
    handler: async (_, reply) => {
      await redis.FLUSHALL()
      reply.code(204).send()
    }
  })
}

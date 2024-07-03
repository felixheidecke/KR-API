import redis from '../../../modules/redis.js'
import type { FastifyInstance, FastifyReply } from 'fastify'

export default async function (App: FastifyInstance) {
  App.delete('/cache', {
    handler: async (_, reply: FastifyReply) => {
      await redis.FLUSHALL()
      reply.code(204).send()
    }
  })
}

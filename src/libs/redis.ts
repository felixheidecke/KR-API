import { captureException } from '@sentry/node'
import { createClient } from 'redis'
import { toMilliseconds } from '../utils/convert-time.js'
import fastify from '#libs/fastify.js'

export async function useRedis(config = {}) {
  const host = process.env.REDIS_HOST || 'localhost'
  const port = +(process.env.REDIS_PORT || 6379)
  const client = await createClient({
    socket: {
      host,
      port,
      reconnectStrategy: (retries: number) => {
        return Math.min(retries * 1500, toMilliseconds({ minutes: 1 }))
      }
    },
    username: process.env.REDIS_USER,
    password: process.env.REDIS_PASSWORD,
    ...config
  })

  client
    .on('ready', () => {
      fastify.log.info(`Redis ready on ${host}:${port}`)
    })
    .on('error', error => {
      captureException(error)
      fastify.log.error(error)
    })
    .connect()

  return client
}

export default await useRedis()

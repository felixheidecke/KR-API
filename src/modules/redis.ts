import { captureException } from '@sentry/node'
import { createClient } from 'redis'
import { toMilliseconds } from '../common/utils/convert-time.js'

export default async function useRedis(config = {}) {
  const client = await createClient({
    socket: {
      host: process.env.REDIS_HOST || 'localhost',
      port: +(process.env.REDIS_PORT || 6379),
      reconnectStrategy
    },
    username: process.env.REDIS_USER,
    password: process.env.REDIS_PASSWORD,
    ...config
  })

  client
    .on('ready', () => {
      console.log('Redis ready on', process.env.REDIS_HOST)
    })
    .on('error', error => {
      captureException(error)
      console.error('Redis connection error', error)
    })
    .connect()

  return client
}

function reconnectStrategy(retries: number) {
  return Math.min(retries * 1500, toMilliseconds({ minutes: 1 }))
}

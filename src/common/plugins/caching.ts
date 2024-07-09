import { HEADER, MIME_TYPE } from '../../constants.js'
import { toSeconds } from '../utils/convert-time.js'
import plugin from 'fastify-plugin'
import redis from '../../modules/redis.js'
import randomId from '../utils/random-id.js'

import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify'

const SALT = randomId('short')
const DEFAULT_BROWSER_TTL = toSeconds({ minutes: 15 })
const DEFAULT_REDIS_TTL = toSeconds({ minutes: 5 })

export default plugin(
  function (
    App: FastifyInstance,
    options: {
      redisTTL?: number // default 5 minutes
      browserTTL?: number // default 15 minutes
      salt?: string
    },
    done: Function
  ) {
    // Store data in request object
    App.decorateRequest('data', null)

    /**
     * Checks if the the requested url exists in the redis.
     * If so, it writes the data to ospx.data
     * @param {import('fastify').FastifyRequest} request Fasify request object
     * @param {import('fastify').FastifyReply} response Fasify response object
     * @returns {Promise<void>}
     */
    App.addHook('onRequest', async (request: FastifyRequest, response: FastifyReply) => {
      const browserTTL = options.browserTTL || DEFAULT_BROWSER_TTL

      try {
        const data = await redis.get(SALT + ':' + request.url)

        response.headers({
          [HEADER.CONTENT_TYPE]: MIME_TYPE.JSON,
          [HEADER.CACHE]: data ? HEADER.CACHE_HIT : HEADER.CACHE_MISS,
          [HEADER.CACHE_CONTROL]: `public, max-age=${browserTTL}`
        })

        if (data) {
          response.send(data)
          request.log.info(`Serving ${request.url} from Cache`)
        }
      } catch (error) {
        request.log.error(error)
        response.headers({
          [HEADER.CACHE]: HEADER.CACHE_FAIL
        })
      }
    })

    /**
     * Writes data to Redis cache
     * @param {object} request Fasify request object
     * @returns {Promise<void>}
     */
    App.addHook('onResponse', async ({ url, log, data }: FastifyRequest) => {
      // Skip if data came from cache or data (should not be cached)
      if (!data || data === null) return

      log.info(`Serving ${url} from database`)

      try {
        await redis.setEx(
          options.salt || SALT + ':' + url,
          options.redisTTL || DEFAULT_REDIS_TTL,
          JSON.stringify(data)
        )
      } catch (error) {
        console.error({ error })
      }
    })

    done()
  },
  { name: 'caching' }
)

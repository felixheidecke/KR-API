import { HEADER, MIME_TYPE } from '../../constants.js'
import useRedis from '../../services/redis.js'
import { toSeconds } from '../utils/convert-time.js'

const salt = Math.random().toString(36).substring(2)
const redis = await useRedis()

/**
 * Add cache model to request models
 *
 * @param {object} request Fastify request object
 * @returns {Promise<object>} request.cache added
 */

export const setupCacheHook = async (request, config = {}) => {
  request.data = null
  request.cache = {
    wasHit: false,
    redisTTL: toSeconds({ minutes: 5 }),
    browserTTL: toSeconds({ minutes: 15 }),
    ...config
  }
}

/**
 * Checks if the the requested url exists in the redis.
 * If so, it writes the data to ospx.data
 * @param {import('fastify').FastifyRequest} request Fasify request object
 * @param {import('fastify').FastifyReply} response Fasify response object
 * @returns {Promise<void>}
 */

export const readCacheHook = async (request, response) => {
  try {
    request.data = await redis.get(salt + ':' + request.url)
    request.cache.wasHit = !!request.data

    response.headers({
      [HEADER.CONTENT_TYPE]: MIME_TYPE.JSON,
      [HEADER.CACHE]: request.cache.wasHit ? HEADER.CACHE_HIT : HEADER.CACHE_MISS,
      [HEADER.CACHE_CONTROL]: `public, max-age=${request.cache.browserTTL}`
    })

    if (request.data) {
      response.send(request.data)
      request.log.info(`Serving from Cache`)
    }
  } catch (error) {
    request.log.error(error)
    response.headers({
      [HEADER.CACHE]: HEADER.CACHE_FAIL
    })
  }
}

/**
 * Writes data to Redis cache
 * @param {object} request Fasify request object
 * @returns {Promise<void>}
 */
export const writeCacheHook = async ({ cache, url, log, data }) => {
  // Skip if data came from cache or data (should not be cached)

  if (cache.wasHit || !data || data === null) return

  log.info(`Serving from Datasource`)

  try {
    await redis.setEx(salt + ':' + url, cache.redisTTL, JSON.stringify(data))
  } catch (error) {
    console.error({ error })
  }
}

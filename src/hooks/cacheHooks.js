import { HEADER, MIME_TYPE } from '#constants'
import redis from '#libs/redis'

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
    redisTTL: 60 * 5, // 5 minutes
    browserTTL: 60 * 5, // 5 minutes
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
    request.data = await redis.get(request.url)
    request.cache.wasHit = !!request.data

    response.headers({
      [HEADER.CONTENT_TYPE]: MIME_TYPE.JSON,
      [HEADER.CACHE]: request.cache.wasHit
        ? HEADER.CACHE_HIT
        : HEADER.CACHE_MISS,
      [HEADER.CACHE_CONTROL]: [
        HEADER.PUBLIC,
        HEADER.MAX_AGE(request.cache.browserTTL)
      ].join(', ')
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

  if (cache.wasHit || !data || data === {} || data === null || data === [])
    return

  log.info(`Serving from Datasource`)

  try {
    await redis.SETEX(url, cache.redisTTL, JSON.stringify(data))
  } catch (error) {
    console.error({ error })
  }
}

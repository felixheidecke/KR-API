import { HEADER, MIME_TYPE_JSON } from '#utils/constants'
import redis from '#libs/redis'

const TTL = 90 // 1.5 minutes

redis.connect()

/**
 * Add cache model to request models
 *
 * @param {object} request Fastify request object
 * @returns {Promise<object>} request.cache added
 */

const onRequest = async (request, config = {}) => {
  return (request.cache = {
    data: null, // Data
    wasHit: false,
    shouldSave: false, // Data should be put in cache
    ttl: TTL,
    ...config
  })
}

/**
 * Checks if the the requested url exists in the redis. If so, it writes the data to ospx.data
 * @param {object} request Fasify request object
 * @param {object} response Fasify response object
 * @returns {Promise<void>}
 */

const preHandler = async (request, response) => {
  try {
    const data = await redis.get(request.url)

    response.headers({
      [HEADER.CONTENT_TYPE]: MIME_TYPE_JSON,
      [HEADER.CACHE]: data ? HEADER.CACHE_HIT : HEADER.CACHE_MISS,
      [HEADER.CACHE_CONTROL]: [
        HEADER.PUBLIC,
        HEADER.MAX_AGE(request.cache.ttl)
      ].join(', ')
    })

    // Update cache info
    request.cache.wasHit = !!data
    request.cache.data = data
  } catch (error) {
    console.error('[KR-API]', error)
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
const onResponse = async ({ cache, url }) => {
  // Skip if data came from cache or data (should not be cached)
  if (cache.wasHit || !cache.shouldSave) return

  const data = JSON.stringify(cache.data)

  try {
    await redis.SETEX(url, cache.ttl, data)
  } catch (error) {
    console.error({ error })
  }
}

export default {
  onRequest,
  preHandler,
  onResponse
}

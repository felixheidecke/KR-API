import { HEADER, MIME_TYPE_JSON } from '#libs/constants'
import { REDIS } from '#config'

import { createClient } from 'redis';

export const redis = createClient({
  socket: {
    host: REDIS.HOST,
    port: REDIS.PORT
  },
  username: REDIS.USER,
  password: REDIS.PASSWORD
});

redis.connect();

/**
 * Add cache model to request models
 * 
 * @param {object} request Fastify request object
 * @returns {Promise<object>} request.cache added
 */

const onRequest = async (request) => {
  return (request.cache = {
    data: null, // Data
    wasHit: false,
    shouldSave: false, // Data should be put in cache
    ttl: 6000 // 1 hour
  });
};

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
    });

    // Update cache info
    request.cache.wasHit = !!data
    request.cache.data = data
  } catch (error) {
    console.error('[KR-API]', error);
    response.headers({
      [HEADER.CACHE]: HEADER.CACHE_FAIL,
    });
  }
};

/**
 * Writes data to Redis cache
 * @param {object} request Fasify request object
 * @returns {Promise<void>}
 */
const onResponse = async ({ cache, url }) => {
  // Skip if data came from cache or data (should not be cached)
  if (cache.wasHit || !cache.shouldSave) return;

  const data = JSON.stringify(cache.data);

  try {
    await redis.SETEX(url, cache.ttl, data);
  } catch (error) {
    console.error({ error });
  }
};

export default {
  onRequest,
  preHandler,
  onResponse
}
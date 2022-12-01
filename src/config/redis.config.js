const { env } = process

export const host = env.REDIS_HOST || 'localhost'
export const port = env.REDIS_PORT || 6379
export const username = env.REDIS_USER || null
export const password = env.REDIS_PASSWORD || null

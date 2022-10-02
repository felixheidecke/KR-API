const { env } = process

export const host = env.APP_HOST || 'localhost'
export const port = env.APP_PORT || 8300
export const cert = env.APP_CERT || null
export const key = env.APP_KEY || null
export const apiKeys = env.APP_API_KEYS ? JSON.parse(env.APP_API_KEYS) : {}

const { env } = process

export const host = env.APP_HOST || 'localhost'
export const port = env.APP_PORT || 8300
export const cert = env.APP_CERT || null
export const key = env.APP_KEY || null
export const secret = env.APP_SECRET || 'not a good secret'

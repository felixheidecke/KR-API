const { env } = process

export const dsn = env.SENTRY_DSN || undefined

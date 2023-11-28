import * as Sentry from '@sentry/node'

export const dsn = process.env.SENTRY_DSN

Sentry.init({ dsn })

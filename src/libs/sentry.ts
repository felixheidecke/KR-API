import '../env.js'
import * as Sentry from '@sentry/node'

if (process.env.NODE_ENV === 'production') {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV,
    attachStacktrace: false,
    serverName: process.env.APP_HOST
  })
}

export default Sentry

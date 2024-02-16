import './env.js'
import App from './main.js'

import type { FastifyListenOptions } from 'fastify'

App.listen(
  {
    port: process.env.APP_PORT || 8300,
    host: process.env.APP_HOST || 'localhost'
  } as FastifyListenOptions,
  error => {
    if (!error) return

    App.log.error(error)
    process.exit(1)
  }
)

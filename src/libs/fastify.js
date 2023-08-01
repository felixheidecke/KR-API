import Fastify from 'fastify'
import fs from 'fs'
import pkg from '../../package.json' assert { type: 'json' }
import { cert, key } from '#config/app.config'

export default Fastify({
  logger: {
    mixin() {
      return { version: pkg.version }
    },
    serializers: {
      req(request) {
        return {
          method: request.method,
          origin: request.headers.origin || 'unknown',
          url: request.url,
          parameters: request.params
        }
      }
    }
  },
  trustProxy: true,
  https: !!cert
    ? {
        cert: fs.readFileSync(cert),
        key: fs.readFileSync(key),
        allowHTTP1: true
      }
    : false
})

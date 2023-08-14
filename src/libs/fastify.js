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
          url: request.url,
          origin: request.headers.origin
            ? new URL(request.headers.origin).hostname
            : 'unknown',
          remote: request.ip
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

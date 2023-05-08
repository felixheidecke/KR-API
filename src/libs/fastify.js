import Fastify from 'fastify'
import fs from 'fs'
import pkg from '../../package.json' assert { type: 'json' }
import { cert, key } from '#config/app.config'

export default Fastify({
  logger: {
    mixin() {
      return { version: pkg.version }
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

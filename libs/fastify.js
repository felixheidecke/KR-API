import Fastify from 'fastify'
import fs from 'fs'

import { cert, key } from '#config/app.config'

export default Fastify({
  logger: true,
  trustProxy: true,
  https: !!cert
    ? {
        cert: fs.readFileSync(cert),
        key: fs.readFileSync(key),
        allowHTTP1: true
      }
    : false
})

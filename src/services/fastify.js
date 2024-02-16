import Fastify from 'fastify'
import fs from 'fs'
import pkg from '../../package.json' assert { type: 'json' }
import format from 'date-fns/format'

const cert = process.env.APP_CERT || null
const key = process.env.APP_KEY || null

const producitonLogger = {
  level: 'info',
  mixin() {
    return {
      version: pkg.version
    }
  },
  redact: {
    paths: ['pid', 'hostname'],
    remove: true
  },
  timestamp: () => `,"timestamp":"${format(new Date(), 'yyyy-MM-dd HH:mm:ss')}"`,
  serializers: {
    req(request) {
      return {
        method: request.method,
        origin: request.headers.origin || 'unknown',
        url: request.url
      }
    }
  }
}

const developmentLogger = {
  transport: {
    target: 'pino-pretty',
    options: {
      translateTime: 'HH:MM:ss Z',
      colorize: true
    }
  }
}

export default Fastify({
  logger: process.env.NODE_ENV === 'production' ? producitonLogger : developmentLogger,
  trustProxy: true,
  http2: true,
  https:
    !!cert && !!key
      ? {
          cert: fs.readFileSync(cert),
          key: fs.readFileSync(key),
          allowHTTP1: true
        }
      : false
})

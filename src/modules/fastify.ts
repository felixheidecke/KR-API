import Fastify from 'fastify'
import fs from 'fs'
import pkg from '../../package.json' assert { type: 'json' }
import { format } from 'date-fns'

export function useFasitfy(config = {}) {
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
      req(request: Fastify.FastifyRequest) {
        return {
          method: request.method,
          origin: request.headers.origin || request.headers.host || 'unknown',
          url: request.url,
          params: request.params
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

  return Fastify({
    logger: process.env.NODE_ENV === 'production' ? producitonLogger : developmentLogger,
    trustProxy: true,
    //@ts-ignore
    http2: !!cert,
    https:
      !!cert && !!key
        ? {
            cert: fs.readFileSync(cert),
            key: fs.readFileSync(key),
            allowHTTP1: true
          }
        : false,
    ...config
  })
}

export default useFasitfy()

import Fastify from 'fastify'
import fs from 'fs'
import pkg from '#utils/package-json.js'
import { format } from 'date-fns'
import type { FastifyRequest } from 'fastify'

export function useFasitfy(config = {}) {
  const cert = process.env.APP_CERT || null
  const key = process.env.APP_KEY || null
  const ca = process.env.APP_CA
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
          origin: request.headers.origin || request.headers.host || request.ip || 'unknown',
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
            ca: ca ? fs.readFileSync(ca) : null,
            allowHTTP1: true
          }
        : false,
    ...config
  })
}

export default useFasitfy()

// Types

type HasParams<T> = 'params' extends keyof T ? { Params: T['params'] } : {}
type HasQuery<T> = 'query' extends keyof T ? { Querystring: T['query'] } : {}
type HasBody<T> = 'body' extends keyof T ? { Body: T['body'] } : {}

export type InferFastifyRequest<T> = FastifyRequest<HasParams<T> & HasQuery<T> & HasBody<T>>

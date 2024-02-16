import type { FastifyRequest } from 'fastify'

type HasParams<T> = 'params' extends keyof T ? { Params: T['params'] } : {}
type HasQuery<T> = 'query' extends keyof T ? { Querystring: T['query'] } : {}
type HasBody<T> = 'body' extends keyof T ? { Body: T['body'] } : {}

export type InferFastifyRequest<T> = FastifyRequest<HasParams<T> & HasQuery<T> & HasBody<T>>

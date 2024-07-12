import type { FastifyInstance } from 'fastify'

export default function info(App: FastifyInstance, _: { prefix: string }, done: Function) {
  App.register(import('./controller/info-controller.js'))

  done()
}

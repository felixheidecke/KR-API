import { cacheControlNoStoreHandler } from '#utils/header-hooks.js'
import type { FastifyInstance } from 'fastify'

export default function admin(App: FastifyInstance, _: { prefix: string }, done: Function) {
  // prettier-ignore
  App
    .addHook('onSend', cacheControlNoStoreHandler)
    .register(import('#plugins/authentication/index.js'), {
      authorize: ({ client }) => client.isSuperuser
    })
    .register(import('./controller/cache-controller.js'))

  done()
}

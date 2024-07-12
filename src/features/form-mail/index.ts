import { cacheControlNoStoreHandler } from '#utils/header-hooks.js'
import type { FastifyInstance } from 'fastify'

export default function formMail(App: FastifyInstance, _: { prefix: string }, done: Function) {
  App.addHook('onRequest', cacheControlNoStoreHandler)
    .register(import('#plugins/authentication/index.js'), { authorize: true })
    .register(import('./controller/form-mail-controller.js'))

  done()
}

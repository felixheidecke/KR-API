import { setNoStoreHeaders } from '../../common/hooks/headerHooks.js'
import type { FastifyInstance } from 'fastify'

export default function formMail(App: FastifyInstance, _: { prefix: string }, done: Function) {
  App.addHook('onRequest', setNoStoreHeaders)
    .register(import('../../common/plugins/authentication/index.js'), { authorize: true })
    .register(import('./controller/FormMailController.js'))

  done()
}

import { setNoStoreHeaders } from '../../common/hooks/headerHooks.js'
import type { FastifyInstance } from 'fastify'

export default function admin(App: FastifyInstance, _: { prefix: string }, done: Function) {
  // prettier-ignore
  App
    .addHook('onSend', setNoStoreHeaders)
    .register(import('../../common/plugins/authentication/index.js'), {
      authorize: ({ client }) => client.isSuperuser
    })
    .register(import('./controller/CacheController.js'))

  done()
}

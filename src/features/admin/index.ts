import { setNoStoreHeaders } from '../../common/hooks/headerHooks.js'
import { AuthorizationPlugin } from '../../common/plugins/authorization/types.js'
import type { FastifyInstance } from 'fastify'

const prefix = '/admin'

export default function admin(App: FastifyInstance, _: never, done: Function) {
  App.register(import('../../common/plugins/authorization/index.js'), {
    authorize: AuthorizationPlugin.Authorize.SUPERUSER
  })
  App.addHook('onRequest', setNoStoreHeaders)
  App.register(import('./controller/CacheController.js'), { prefix })

  done()
}

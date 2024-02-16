import { cacheHeadersNoStoreHook as cacheHeadersNoStore } from '../../common/hooks/headerHooks.js'

export default function admin(App, _, done) {
  App.register(import('../../common/plugins/authorization.js'), {
    authorize: ['superuser']
  })

  App.addHook('onRequest', cacheHeadersNoStore)

  // Routes
  App.register(import('./controller/CacheController.js'))

  done()
}

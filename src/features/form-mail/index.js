import { cacheHeadersNoStoreHook } from '../../common/hooks/headerHooks.js'

export default function formMail(App, _, done) {
  App.addHook('onRequest', cacheHeadersNoStoreHook)

  App.register(import('./controller/FormMailController.js'))

  done()
}

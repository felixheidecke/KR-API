import { setNoStoreHeaders } from '../../common/hooks/headerHooks.js'

export default function formMail(App, _, done) {
  App.addHook('onRequest', setNoStoreHeaders)

  App.register(import('./controller/FormMailController.js'))

  done()
}

import { toSeconds } from '../../common/utils/convert-time.js'

export default function cms(App, _, done) {
  App.register(import('../../common/plugins/caching.js'), {
    browserTTL: toSeconds({ minutes: 30 })
  })

  App.register(import('../../common/plugins/authorization.js'), {
    authorize: ['module-match']
  })

  // Routes
  App.register(import('./controller/ArticleController.js'))
  App.register(import('./controller/EventController.js'))
  App.register(import('./controller/GalleryController.js'))
  App.register(import('./controller/MenuCardController.js'))

  done()
}

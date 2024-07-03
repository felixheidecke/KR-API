import { toSeconds } from '../../common/utils/convert-time.js'

const prefix = '/cms'

export default function cms(App, _, done) {
  App.register(import('../../common/plugins/caching.js'), {
    browserTTL: toSeconds({ minutes: 30 })
  })

  App.register(import('../../common/plugins/authorization/index.js'), {
    authorize: 'module-match'
  })

  // Routes
  App.register(import('./controller/ArticleController.js'), { prefix })
  App.register(import('./controller/EventController.js'), { prefix })
  App.register(import('./controller/GalleryController.js'), { prefix })
  App.register(import('./controller/MenuCardController.js'), { prefix })

  done()
}

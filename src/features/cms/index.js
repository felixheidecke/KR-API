import * as caching from '../../common/hooks/cacheHooks.js'

export default function cms(App, _, done) {
  // App.addHook('onRequest', caching.setupCacheHook)
  // App.addHook('preHandler', caching.readCacheHook)
  // App.addHook('onResponse', caching.writeCacheHook)

  App.register(import('./controller/ArticleController.js'))
  App.register(import('./controller/EventController.js'))
  App.register(import('./controller/GalleryController.js'))
  App.register(import('./controller/MenuCardController.js'))

  done()
}

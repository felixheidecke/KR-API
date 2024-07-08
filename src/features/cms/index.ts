import { toSeconds } from '../../common/utils/convert-time.js'
import type { FastifyInstance } from 'fastify'

export default function cms(App: FastifyInstance, _: { prefix: string }, done: Function) {
  App

    // Plugins
    .register(import('../../common/plugins/authentication/index.js'), {
      authorize: ({ client, params }) => client.hasModuleAccess((params as any).module)
    })
    .register(import('../../common/plugins/caching.js'), {
      browserTTL: toSeconds({ minutes: 30 })
    })

    // Routes
    .register(import('./controller/ArticleController.js'))
    .register(import('./controller/EventController.js'))
    .register(import('./controller/GalleryController.js'))
    .register(import('./controller/MenuCardController.js'))

  done()
}

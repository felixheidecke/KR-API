import { toSeconds } from '../../common/utils/convert-time.js'
import type { FastifyInstance } from 'fastify'

export default function cms(App: FastifyInstance, _: { prefix: string }, done: Function) {
  App

    // Caching
    .register(import('../../common/plugins/caching.js'), {
      browserTTL: toSeconds({ minutes: 30 })
    })

    // Authenitcation
    .register(import('../../common/plugins/authentication/index.js'), {
      authorize: ({ client, params }) => {
        const { module } = params as { module?: string }

        // ! IMPORTANT !
        // If no module is provided, access needs to be handlered by the route
        return !module ? true : client.hasModuleAccess(+module)
      }
    })

    // Routes
    .register(import('./controller/ArticleController.js'))
    .register(import('./controller/EventController.js'))
    .register(import('./controller/GalleryController.js'))
    .register(import('./controller/MenuCardController.js'))

  done()
}

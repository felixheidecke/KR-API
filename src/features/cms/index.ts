import { toSeconds } from '#utils/convert-time.js'
import type { FastifyInstance } from 'fastify'

export default function cms(App: FastifyInstance, _: { prefix: string }, done: Function) {
  App

    // Caching
    .register(import('#plugins/caching/index.js'), {
      browserTTL: toSeconds({ minutes: 30 })
    })

    // Authenitcation
    .register(import('#plugins/authentication/index.js'), {
      authorize: ({ client, params }) => {
        const { module } = params as { module?: string }

        // ! IMPORTANT !
        // If no module is provided, access needs to be handlered by the route
        return !module ? true : client.hasModuleAccess(+module)
      }
    })

    // Routes
    .register(import('./controller/article-controller.js'))
    .register(import('./controller/event-controller.js'))
    .register(import('./controller/gallery-controller.js'))
    .register(import('./controller/menu-card-controller.js'))

  done()
}

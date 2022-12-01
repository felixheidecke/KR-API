import * as cache from '#hooks/cache'
import { getEventController, getEventsController } from '#controller/event'

export default async (App) => {
  App.route({
    ...routeTemplate,
    url: '/events/:id',
    schema: {
      params: {
        type: 'object',
        required: ['id'],
        properties: {
          id: { type: 'number' }
        }
      },
      query: {
        type: 'object',
        properties: {
          limit: { type: 'number' }
        }
      }
    },
    handler: getEventsController
  })

  App.route({
    ...routeTemplate,
    url: '/event/:id',
    schema: {
      params: {
        type: 'object',
        required: ['id'],
        properties: {
          id: { type: 'number' }
        }
      }
    },
    handler: getEventController
  })
}

const routeTemplate = {
  method: 'GET',
  onRequest: cache.onRequest,
  preHandler: cache.preHandler,
  onResponse: cache.onResponse
}

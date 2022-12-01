import * as cache from '#hooks/cache'
import * as controller from '#controller/article'

export default async (App) => {
  App.route({
    ...routeTemplate,
    url: '/articles/:id',
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
    handler: controller.getArticlesController
  })

  App.route({
    ...routeTemplate,
    url: '/article/:id',
    schema: {
      params: {
        type: 'object',
        properties: {
          id: { type: 'number' }
        }
      }
    },
    handler: controller.getArticleController
  })
}

const routeTemplate = {
  method: 'GET',
  onRequest: cache.onRequest,
  preHandler: cache.preHandler,
  onResponse: cache.onResponse
}

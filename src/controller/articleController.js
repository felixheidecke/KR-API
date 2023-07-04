import * as caching from '#hooks/cacheHooks'
import Article from '#model/articleModel'
import Articles from '#model/articlesModel'

export default async function (App) {
  App.addHook('onRequest', caching.setupCacheHook)
  App.addHook('preHandler', caching.readCacheHook)
  App.addHook('onResponse', caching.writeCacheHook)

  /**
   * Return a single article
   */

  App.get('/article/:id', {
    schema: {
      params: {
        type: 'object',
        required: ['id'],
        properties: {
          id: {
            type: 'number'
          }
        }
      },
      query: {
        type: 'object',
        properties: {
          parts: {
            type: 'string',
            default: 'content'
          }
        }
      }
    },
    handler: async (request, response) => {
      const { params, query } = request
      const article = new Article(params.id)

      await article.load(query)

      if (article.exists) {
        request.data = article.data

        response.send(request.data)
      } else {
        App.notFoundHandler(response, 'Article not found')
      }
    }
  })

  /**
   * Return multiple articles based on their module
   *
   */

  App.get('/articles/:module', {
    schema: {
      params: {
        type: 'object',
        required: ['module'],
        properties: {
          module: {
            type: 'number'
          }
        }
      },
      query: {
        type: 'object',
        properties: {
          status: {
            type: 'string',
            enum: ['live', 'archived'],
            default: 'live'
          },
          parts: {
            type: 'string'
          },
          limit: {
            type: 'number'
          }
        }
      }
    },

    handler: async (request, response) => {
      const { params, query } = request
      const articles = new Articles(params.module)

      await articles.load(query)

      if (articles.exists) {
        request.data = articles.data

        response.send(request.data)
      } else {
        App.notFoundHandler(response, 'Articles not found.')
      }
    }
  })
}

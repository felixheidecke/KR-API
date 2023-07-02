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

      try {
        await article.load(query)

        request.data = article.data

        if (request.data) {
          response.send(request.data)
        } else {
          App.notFoundHandler(response, `No article with ID ${params.module}`)
        }
      } catch (error) {
        App.catchHandler(response, error)
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

      try {
        await articles.load(query)

        request.data = articles.data

        if (request.data) {
          response.send(request.data)
        } else {
          App.notFoundHandler(
            response,
            `No articles found for ID ${params.module}`
          )
        }
      } catch (error) {
        App.catchHandler(response, error)
      }
    }
  })
}

import * as cache from '#hooks/cache'
import { getArticle } from '#data/article'
import { getArticles } from '#data/articles'

const routeTemplate = {
  method: 'GET',
  onRequest: cache.onRequest,
  preHandler: cache.preHandler,
  onResponse: cache.onResponse
}

const getArticlesController = {
  ...routeTemplate,

  url: '/article/:id',

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
        full: {
          type: 'boolean'
        }
      }
    }
  },
  handler: async (request, response) => {
    const { params, query } = request

    try {
      request.data = (await getArticle(params.id, { full: !!query.full })).get()
      request.cache.shouldSave = !!request.data

      if (request.data) {
        response.send(request.data)
      } else {
        response.code(404).send({ message: 'Article not found.' })
      }
    } catch (error) {
      request.cache.shouldSave = false
      response.code(500).send('An Error occured')
      console.error(error)
    }
  }
}

const getArticleController = {
  ...routeTemplate,

  url: '/articles/:module',

  schema: {
    params: {
      type: 'object',
      required: ['module'],
      properties: {
        module: { type: 'number' }
      }
    },
    query: {
      type: 'object',
      properties: {
        full: {
          type: 'boolean'
        },
        limit: {
          type: 'number'
        },
        archived: {
          type: 'boolean'
        },
        inactive: {
          type: 'boolean'
        }
      }
    }
  },
  handler: async (request, response) => {
    const { params, query } = request

    try {
      const articles = (
        await getArticles(params.module, {
          archived: !!query.archived,
          limit: query.limit,
          inactive: query.inactive,
          full: query.full
        })
      ).get()

      request.cache.shouldSave = !!articles

      if (articles) {
        request.data = articles.map(({ get }) => get())
        response.send(request.data)
      } else {
        response.code(404).send({ message: 'Articles not found.' })
      }
    } catch (error) {
      request.cache.shouldSave = false
      response.code(500).send('An Error occured')
      console.error(error)
    }
  }
}

export default async (App) => {
  App.route(getArticlesController)
  App.route(getArticleController)
}

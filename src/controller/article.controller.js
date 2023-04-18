import * as cache from '#hooks/cache'
import { getArticle } from '#data/article'
import { getArticles } from '#data/articles'
import { pick } from 'lodash-es'

const routeTemplate = {
  method: 'GET',
  onRequest: cache.onRequest,
  preHandler: cache.preHandler,
  onResponse: cache.onResponse
}

const getArticleController = {
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
    const { params } = request
    const query = pick(request.query, ['full'])

    try {
      request.data = (await getArticle(params.id, { ...query })).get()
      request.cache.shouldSave = !!request.data

      if (request.data) {
        response.send(request.data)
      } else {
        response.code(404).send({ message: 'Article not found.' })
      }
    } catch (error) {
      catchHandler(response, error)
    }
  }
}

const getArticlesController = {
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
        status: {
          type: 'string',
          enum: ['live', 'archived']
        },
        limit: {
          type: 'number'
        }
      }
    }
  },
  handler: async (request, response) => {
    const { params } = request
    const query = pick(request.query, ['status', 'full', 'limit'])

    try {
      const articles = (await getArticles(params.module, query)).get()

      request.cache.shouldSave = !!articles

      if (articles) {
        request.data = articles.map(({ get }) => get())
        response.send(request.data)
      } else {
        response.code(404).send({ message: 'Articles not found.' })
      }
    } catch (error) {
      catchHandler(response, error)
    }
  }
}

export default async (App) => {
  App.route(getArticlesController)
  App.route(getArticleController)
}

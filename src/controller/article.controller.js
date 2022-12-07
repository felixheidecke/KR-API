import * as cache from '#hooks/cache'

import { getArticleById, getArticlesByModule } from '#data/articles'
import { catchHandler, sendNotFoundHandler } from '#utils/controller'

const routeTemplate = {
  method: 'GET',
  onRequest: cache.onRequest,
  preHandler: cache.preHandler,
  onResponse: cache.onResponse
}

const getArticlesController = {
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

  /**
   * @param {import('fastify').FastifyRequest} request Fastify request object
   * @param {import('fastify').FastifyReply} response Fastify response object
   */
  handler: async (request, response) => {
    // Request params
    const { id } = request.params
    const { limit } = request.query

    try {
      request.data = await getArticlesByModule(id, { limit })

      if (!request.data) {
        sendNotFoundHandler(response)
      } else {
        response.send(request.data)
      }
    } catch (error) {
      catchHandler(response, error)
    }
  }
}

const getArticleController = {
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

  /**
   * @param {import('fastify').FastifyRequest} request Fastify request object
   * @param {import('fastify').FastifyReply} response Fastify response object
   */
  handler: async (request, response) => {
    // Request params
    const { id } = request.params

    try {
      request.data = await getArticleById(id)

      if (!request.data) {
        sendNotFoundHandler(response)
      } else {
        response.send(request.data)
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

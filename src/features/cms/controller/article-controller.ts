import { ArticleService } from '../services/article-service.js'
import { getArticleRequestSchema } from '../schemas/get-article-request-schema.js'
import { getArticlesRequestSchema } from '../schemas/get-articles-request-schema.js'

import type { FastifyInstance } from 'fastify'
import type { GetArticleRequestSchema } from '../schemas/get-article-request-schema.js'
import type { GetArticlesRequestSchema } from '../schemas/get-articles-request-schema.js'
import type { Article } from '../entities/article.js'
import type { InferFastifyRequest } from '#libs/fastify.js'

export default async function (App: FastifyInstance) {
  /**
   * GET route to retrieve a specific article based on module and id.
   * Validates request using 'GetArticleRequestSchema'.
   *
   * @param {string} '/articles/:module/:id' - Endpoint to get a specific article.
   * @param {object} options - Route configuration object.
   * @param {Function} options.preValidation - Pre-validation function using 'GetArticleRequestSchema'.
   * @param {Function} options.handler - Async handler function for the route.
   */

  App.get('/articles/:module/:id', {
    preValidation: async (request: InferFastifyRequest<GetArticleRequestSchema>) => {
      const { params } = getArticleRequestSchema.parse(request)

      request.params = params
    },
    handler: async (request, reply) => {
      const { module, id } = request.params
      const article = await ArticleService.getArticle(module, id, {
        shouldThrow: true
      })

      request.data = (article as Article).display()

      reply.send(request.data)
    }
  })

  /**
   * GET route to retrieve a list of articles based on module, optionally filtered by query parameters.
   * Validates request using 'GetArticlesRequestSchema'.
   *
   * @param {string} '/articles/:module' - Endpoint to get articles for a specific module.
   * @param {object} options - Route configuration object.
   * @param {Function} options.preValidation - Pre-validation function using 'GetArticlesRequestSchema'.
   * @param {Function} options.handler - Async handler function for the route.
   */

  App.get('/articles/:module', {
    preValidation: async (request: InferFastifyRequest<GetArticlesRequestSchema>) => {
      const { params, query } = getArticlesRequestSchema.parse(request)

      request.params = params
      request.query = query
    },
    handler: async (request: InferFastifyRequest<GetArticlesRequestSchema>, reply) => {
      const { params, query } = request
      const articles = await ArticleService.getArticles(params.module, query, {
        skipModuleCheck: true,
        shouldThrow: true
      })

      request.data = (articles as Article[]).map(article => article.display())

      reply.send(request.data)
    }
  })
}

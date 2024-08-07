import { ArticleService } from '../services/article-service.js'
import { getArticleRequestSchema } from '../schemas/articles-schema.js'
import { getArticlesRequestSchema } from '../schemas/articles-schema.js'

// --- [ Types ] -----------------------------------------------------------------------------------

import type { FastifyInstance } from 'fastify'
import type { InferFastifyRequest } from '#libs/fastify.js'
import type { z } from 'zod'

type GetArticleRequestSchema = InferFastifyRequest<z.infer<typeof getArticleRequestSchema>>
type GetArticlesRequestSchema = InferFastifyRequest<z.infer<typeof getArticlesRequestSchema>>

// --- [ Controller ] ------------------------------------------------------------------------------

export default async function (App: FastifyInstance) {
  App.get('/articles/:module/:id', {
    preValidation: async (request: GetArticleRequestSchema) => {
      const { params } = getArticleRequestSchema.parse(request)

      request.params = params
    },
    handler: async (request, reply) => {
      const { module, id } = request.params
      const article = await ArticleService.getArticle(module, id)

      request.data = article.display()

      reply.send(request.data)
    }
  })

  App.get('/articles/:module', {
    preValidation: async (request: GetArticlesRequestSchema) => {
      const { params, query } = getArticlesRequestSchema.parse(request)

      request.params = params
      request.query = query
    },
    handler: async (request, reply) => {
      const { params, query } = request
      const articles = await ArticleService.getArticles(params.module, query)

      request.data = articles.map(article => article.display())

      reply.send(request.data)
    }
  })
}

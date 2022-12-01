import { getArticleById, getArticlesByModule } from '#data/articles'
import { catchHandler, sendNotFoundHandler } from '#utils/controller'

/**
 * @param {import('fastify').FastifyRequest} request Fastify request object
 * @param {import('fastify').FastifyReply} response Fastify response object
 */

export const getArticlesController = async (request, response) => {
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

/**
 * @param {import('fastify').FastifyRequest} request Fastify request object
 * @param {import('fastify').FastifyReply} response Fastify response object
 */

export const getArticleController = async (request, response) => {
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

import { getCategory, getCategories } from '#data/shop-category'
import { catchHandler, sendNotFoundHandler } from '#utils/controller'

/**
 *
 * @param {import("fastify").FastifyRequest} request
 * @param {import("fastify").FastifyReply} response
 */

export const getCategoryController = async (request, response) => {
  const { id } = request.params // category id

  try {
    request.data = await getCategory(id)

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
 *
 * @param {import("fastify").FastifyRequest} request
 * @param {import("fastify").FastifyReply} response
 */

export const getCategoryProductsController = async (request, response) => {
  const { id } = request.params // category id

  try {
    request.data = await getProductsByCategory(id)

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
 *
 * @param {import("fastify").FastifyRequest} request
 * @param {import("fastify").FastifyReply} response
 */

export const getCategoriesController = async (request, response) => {
  const { id } = request.params // module id

  try {
    request.data = await getCategories(id)

    if (!request.data) {
      sendNotFoundHandler(response)
    } else {
      response.send(request.data)
    }
  } catch (error) {
    catchHandler(response, error)
  }
}

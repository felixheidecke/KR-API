import { getCategory, getCategories } from '#data/shop-category'
import { catchHandler, sendHandler } from '#utils/controller.helper'

/**
 *
 * @param {import("fastify").FastifyRequest} request
 * @param {import("fastify").FastifyReply} response
 */

export const getCategoryController = async (request, response) => {
  const { id } = request.params // category id

  try {
    const category = await getCategory(id)

    sendHandler(response, request, category)
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
    const products = await getProductsByCategory(id)

    sendHandler(response, request, products)
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
    const categories = await getCategories(id)

    sendHandler(response, request, categories)
  } catch (error) {
    catchHandler(response, error)
  }
}

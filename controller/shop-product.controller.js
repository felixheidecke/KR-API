import { getProduct, getProducts } from '#data/shop-product'
import { catchHandler, sendHandler } from '#utils/controller.helper'

/**
 *
 * @param {import("fastify").FastifyRequest} request
 * @param {import("fastify").FastifyReply} response
 */

export const getProductController = async (request, response) => {
  const { id } = request.params // rtd.Shop3Product[_id]

  try {
    const data = await getProduct(id)

    sendHandler(response, request, data)
  } catch (error) {
    catchHandler(response, error)
  }
}

/**
 *
 * @param {import("fastify").FastifyRequest} request
 * @param {import("fastify").FastifyReply} response
 */

export const getProductsController = async (request, response) => {
  const { id } = request.params // rtd.Shop3Product[module]

  try {
    const data = await getProducts(id)

    sendHandler(response, request, data)
  } catch (error) {
    catchHandler(response, error)
  }
}

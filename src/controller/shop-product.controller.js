import { getProduct, getProducts } from '#data/shop-product'
import { catchHandler, sendNotFoundHandler } from '#utils/controller'

/**
 *
 * @param {import("fastify").FastifyRequest} request
 * @param {import("fastify").FastifyReply} response
 */

export const getProductController = async (request, response) => {
  const { id } = request.params // rtd.Shop3Product[_id]

  try {
    request.data = await getProduct(id)

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

export const getProductsController = async (request, response) => {
  const { id } = request.params // rtd.Shop3Product[module]

  try {
    request.data = await getProducts(id)

    if (!request.data) {
      sendNotFoundHandler(response)
    } else {
      response.send(request.data)
    }
  } catch (error) {
    catchHandler(response, error)
  }
}

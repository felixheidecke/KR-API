import { getProduct, getProducts } from '#data/shop-product'
import { catchHandler, sendNotFoundHandler } from '#utils/controller'
import * as cache from '#hooks/cache'

const routeTemplate = {
  method: 'GET',

  schema: {
    params: {
      type: 'object',
      properties: {
        id: {
          type: 'number'
        }
      }
    }
  },

  onRequest: cache.onRequest,

  preHandler: cache.preHandler,

  onResponse: cache.onResponse
}

const getProductController = {
  ...routeTemplate,

  url: '/shop/product/:id',

  /**
   * @param {import("fastify").FastifyRequest} request
   * @param {import("fastify").FastifyReply} response
   */
  handler: async (request, response) => {
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
}

const getProductsController = {
  ...routeTemplate,

  url: '/shop/:id/products',

  /**
   * @param {import("fastify").FastifyRequest} request
   * @param {import("fastify").FastifyReply} response
   */
  handler: async (request, response) => {
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
}

/**
 * @param {import('fastify').FastifyInstance} App
 */
export default async (App) => {
  App.route(getProductController)
  App.route(getProductsController)
}

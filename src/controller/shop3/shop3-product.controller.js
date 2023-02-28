import { catchHandler, sendNotFoundHandler } from '#utils/controller'
import * as cache from '#hooks/cache'
import { Shop3Product, Shop3Products } from '#src/model/shop3/product.model.js'

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

  url: '/shop/:module/product/:id',

  /**
   * @param {import("fastify").FastifyRequest} request
   * @param {import("fastify").FastifyReply} response
   */
  handler: async (request, response) => {
    const { id, module } = request.params // rtd.Shop3Product[_id]

    try {
      const product = await new Shop3Product().fetch(id, module)

      if (!product.exists()) {
        sendNotFoundHandler(response)
        return
      }

      request.data = product.getAll()

      response.send(request.data)
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
      const products = await new Shop3Products().fetch(id)

      if (!products.hasProducts()) {
        sendNotFoundHandler(response)
        return
      }

      request.data = products.getAll()

      response.send(request.data)
    } catch (error) {
      request.log.fatal(error)
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

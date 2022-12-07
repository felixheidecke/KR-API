import { getCategory, getCategories } from '#data/shop-category'
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

/**
 * Category routes
 *
 * @param {function} App fastify instance
 * @returns {void}
 */

const categoryController = {
  ...routeTemplate,

  url: '/shop/:id/categories',

  handler: async (request, response) => {
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
}

const categoriesController = {
  ...routeTemplate,

  url: '/shop/category/:id',

  handler: async (request, response) => {
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
}

const categoryProductsController = {
  ...routeTemplate,

  url: '/shop/category/:id/products',

  handler: async (request, response) => {
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
}

export default async (App) => {
  App.route(categoryController)
  App.route(categoriesController)
  App.route(categoryProductsController)
}

import { catchHandler, sendNotFoundHandler } from '#utils/controller'
import * as cache from '#hooks/cache'
import { Shop3Products } from '#src/model/shop3/product.model.js'
import {
  Shop3Category,
  Shop3Categories
} from '#src/model/shop3/category.model.js'

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
    const categories = new Shop3Categories()

    try {
      await categories.fetch(id)

      if (!categories.exists()) {
        sendNotFoundHandler(response)
      } else {
        request.data = categories.getAll()
        response.send(request.data)
      }
    } catch (error) {
      catchHandler(response, error)
    }
  }
}

const categoriesController = {
  ...routeTemplate,

  url: '/shop/:module/category/:id',

  handler: async (request, response) => {
    const { id } = request.params // category id
    const category = new Shop3Category()

    try {
      await category.fetch(id)

      if (!category.exists()) {
        sendNotFoundHandler(response)
        return
      }

      request.data = category.getAll()

      response.send(request.data)
    } catch (error) {
      catchHandler(response, error)
    }
  }
}

const categoryProductsController = {
  ...routeTemplate,

  url: '/shop/:module/category/:id/products',

  handler: async (request, response) => {
    const { id } = request.params // category id
    const products = new Shop3Products()

    try {
      await products.fetchByCategory(id)

      if (!products.hasProducts()) {
        sendNotFoundHandler(response)
        return
      }

      request.data = products.getAll()

      response.send(request.data)
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

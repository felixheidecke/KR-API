import cache from '#hooks/cache'
import {
  getCategoriesController,
  getCategoryController,
  getCategoryProductsController
} from '#controller/shop-category'

/**
 * Category routes
 *
 * @param {function} App fastify instance
 * @returns {void}
 */

export default async (App) => {
  App.route({
    ...routeTemplate,
    url: '/shop/:id/categories',
    handler: getCategoriesController
  })

  App.route({
    ...routeTemplate,
    url: '/shop/category/:id',
    handler: getCategoryController
  })

  App.route({
    ...routeTemplate,
    url: '/shop/category/:id/products',
    handler: getCategoryProductsController
  })
}

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

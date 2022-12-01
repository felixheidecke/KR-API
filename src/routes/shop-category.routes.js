import * as cache from '#hooks/cache'
import * as controller from '#controller/shop-category'

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
    handler: controller.getCategoriesController
  })

  App.route({
    ...routeTemplate,
    url: '/shop/category/:id',
    handler: controller.getCategoryController
  })

  App.route({
    ...routeTemplate,
    url: '/shop/category/:id/products',
    handler: controller.getCategoryProductsController
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

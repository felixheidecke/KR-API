import cache from '#hooks/cache'
import {
  getProductController,
  getProductsController
} from '#controller/shop-product'

export default async (App) => {
  App.route({
    ...routeTemplate,
    url: '/shop/product/:id',
    handler: getProductController
  })

  App.route({
    ...routeTemplate,
    url: '/shop/:id/products',
    handler: getProductsController
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

import * as caching from '#hooks/cacheHooks'
import ShopProduct from '#model/shop/shopProductModel'
import ShopProducts from '#model/shop/shopProductsModel'

export default async function (App) {
  App.addHook('onRequest', caching.setupCacheHook)
  App.addHook('preHandler', caching.readCacheHook)
  App.addHook('onResponse', caching.writeCacheHook)

  /**
   * Return a list of products for a given shop id
   */

  App.get('/shop/:module/products', {
    schema: {
      params: {
        type: 'object',
        required: ['module'],
        properties: {
          module: {
            type: 'number'
          }
        }
      },
      query: {
        limit: {
          type: 'number'
        },
        filter: {
          type: 'string'
        }
      }
    },

    handler: async function (request, response) {
      const { params, query } = request
      const products = new ShopProducts(params.module)

      try {
        await products.load({
          limit: query.limit,
          highlight: query.filter?.includes('highlight')
        })

        request.data = products.length ? products.data : []

        response.send(request.data)
      } catch (error) {
        App.catchHandler(response, error)
      }
    }
  })

  /**
   * Return a product for a given shop id / product id
   */

  App.get('/shop/:module/products/:id', {
    schema: {
      params: {
        type: 'object',
        required: ['id', 'module'],
        properties: {
          id: {
            type: 'number'
          },
          module: {
            type: 'number'
          }
        }
      }
    },

    handler: async function (request, response) {
      const { id, module } = request.params
      const product = new ShopProduct(id, module)

      try {
        await product.load()

        if (!product.id) {
          App.notFoundHandler(response, `Product ${module}/${id} not found!`)
          return
        }

        request.data = product.data

        response.send(request.data)
      } catch (error) {
        App.catchHandler(response, error)
      }
    }
  })
}

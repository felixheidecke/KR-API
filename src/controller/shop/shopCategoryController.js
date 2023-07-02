import { pick } from 'lodash-es'
import * as caching from '#hooks/cacheHooks'
import ShopCategories from '#model/shop/shopCategoriesModel'
import ShopCategory from '#model/shop/shopCategoryModel'
import ShopProducts from '#model/shop/shopProductsModel'

export default async function (App) {
  App.addHook('onRequest', caching.setupCacheHook)
  App.addHook('preHandler', caching.readCacheHook)
  App.addHook('onResponse', caching.writeCacheHook)

  /**
   * Return a list of products for a given shop id
   */

  App.get('/shop/:module/categories', {
    schema: {
      params: {
        type: 'object',
        required: ['module'],
        properties: {
          module: {
            type: 'number'
          }
        }
      }
    },

    handler: async (request, response) => {
      const { params } = request
      const categories = new ShopCategories(params.module)

      try {
        await categories.load()

        request.data = categories.data

        response.send(request.data)
      } catch (error) {
        App.catchHandler(response, error)
      }
    }
  })

  App.get('/shop/:module/categories/:id', {
    schema: {
      params: {
        type: 'object',
        required: ['module', 'id'],
        properties: {
          module: {
            type: 'number'
          },
          id: {
            type: 'number'
          }
        }
      },
      query: {
        type: 'object',
        properties: {
          parts: {
            type: 'string'
          }
        }
      }
    },

    handler: async (request, response) => {
      const { params, query } = request
      const categories = new ShopCategory(params.id, params.module)

      try {
        await categories.load({ parts: query.parts })

        if (!categories.data) {
          response.code(404).send({ code: 404, message: `Category not found.` })
          return
        }

        request.data = categories.data
        response.send(request.data)
      } catch (error) {
        App.catchHandler(response, error)
      }
    }
  })

  App.get('/shop/:module/categories/:id/products', {
    schema: {
      params: {
        type: 'object',
        required: ['module', 'id'],
        properties: {
          module: {
            type: 'number'
          },
          id: {
            type: 'number'
          }
        }
      },
      query: {
        type: 'object',
        properties: {
          parts: {
            type: 'string'
          }
        }
      }
    },

    handler: async (request, response) => {
      const { params } = request
      const products = new ShopProducts(params.module)

      try {
        request.data = (
          await products.load({
            category: params.id
          })
        ).data

        response.send(request.data)
      } catch (error) {
        App.catchHandler(response, error)
      }
    }
  })
}

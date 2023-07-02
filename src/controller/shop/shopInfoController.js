import ShopInfo from '#model/shop/shopInfoModel'
import * as caching from '#hooks/cacheHooks'

export default async (App) => {
  App.addHook('onRequest', caching.setupCacheHook)
  App.addHook('preHandler', caching.readCacheHook)
  App.addHook('onResponse', caching.writeCacheHook)

  App.get('/shop/:module/info', {
    schema: {
      params: {
        type: 'object',
        properties: {
          module: {
            type: 'number'
          }
        }
      }
    },

    handler: async (request, response) => {
      const shopInfo = new ShopInfo(request.params.module)

      try {
        await shopInfo.load()

        request.data = shopInfo.data

        response.send(request.data)
      } catch (error) {
        App.catchHandler(response, error)
      }
    }
  })
}

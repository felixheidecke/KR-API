import { getShopInfoController } from '#controller/shop-info'
import cache from '#hooks/cache'

export default async (App) => {
  App.route({
    method: 'GET',

    url: '/shop/:module/info',

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

    handler: getShopInfoController,

    onRequest: cache.onRequest,

    preHandler: cache.preHandler,

    onResponse: cache.onResponse
  })
}

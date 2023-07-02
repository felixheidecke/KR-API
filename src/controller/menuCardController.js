import * as caching from '#hooks/cacheHooks'
import MenuCard from '#model/menuCardModel'

export default async (App) => {
  App.addHook('onRequest', caching.setupCacheHook)
  App.addHook('preHandler', caching.readCacheHook)
  App.addHook('onResponse', caching.writeCacheHook)

  App.get('/menu-card/:id', {
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
    handler: async (request, response) => {
      const { params } = request
      const menuCard = new MenuCard(params.id)

      try {
        request.data = (await menuCard.load()).data

        response.send(request.data)
      } catch (error) {
        App.catchHandler(response, error)
      }
    }
  })
}

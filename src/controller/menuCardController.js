import * as caching from '#hooks/cacheHooks'
import Menu from '#model/menuCardModel'

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
      const menu = new Menu(params.id)

      await menu.load()

      if (menu.exists) {
        request.data = menu.data

        response.send(request.data)
      } else {
        App.notFoundHandler(response, 'Menu not found')
      }
    }
  })
}

import * as caching from '#hooks/cacheHooks'
import Album from '#model/albumModel'
import Gallery from '#model/galleryModel'

export default async function (App) {
  App.addHook('onRequest', caching.setupCacheHook)
  App.addHook('preHandler', caching.readCacheHook)
  App.addHook('onResponse', caching.writeCacheHook)

  App.get('/gallery/album/:id', {
    handler: async (request, response) => {
      const { params } = request
      const album = new Album(params.id)

      try {
        request.data = (await album.load()).data

        response.send(request.data)
      } catch (error) {
        App.catchHandler(response, error)
      }
    }
  })

  App.get('/gallery/:id', {
    handler: async (request, response) => {
      const { params } = request
      const gallery = new Gallery(+params.id)

      try {
        request.data = (await gallery.load()).data

        response.send(request.data)
      } catch (error) {
        App.catchHandler(response, error)
      }
    }
  })
}

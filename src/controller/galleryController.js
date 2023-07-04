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

      await album.load()

      if (album.exists) {
        request.data = album.data

        response.send(request.data)
      } else {
        App.notFoundHandler(response, 'Album not found.')
      }
    }
  })

  App.get('/gallery/:id', {
    handler: async (request, response) => {
      const { params } = request
      const gallery = new Gallery(params.id)

      await gallery.load()

      if (gallery.exists) {
        request.data = gallery.data

        response.send(request.data)
      } else {
        App.notFoundHandler(response, 'Gallery not found.')
      }
    }
  })
}

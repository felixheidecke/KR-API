import { catchHandler, notFoundHandler } from '#utils/controller'
import cache from '#src/hooks/cacheHooks.js'
import { GalleryModel } from '#src/model/galleryModel.js'
import { AlbumModel } from '#src/model/albumModel.js'

const getAlbumController = {
  method: 'GET',
  url: '/gallery/album/:id',

  /**
   * Fetch gallery with images by module (id)
   *
   * @param {object} request Fastify request object
   * @param {object} response Fastify response object
   * @returns {Promise<void>}
   */

  handler: async (request, response) => {
    const { id } = request.params
    const album = AlbumModel()

    try {
      request.data = (await album.fetch(id)).get()

      if (!request.data) {
        notFoundHandler(response)
      } else {
        response.send(request.data)
      }
    } catch (error) {
      catchHandler(response, error)
    }
  }
}

const getGalleryController = {
  method: 'GET',
  url: '/gallery/:id',

  /**
   * Fetch gallery with images by id (id)
   *
   * @param {object} request Fastify request object
   * @param {object} response Fastify response object
   * @returns {Promise<void>}
   */
  handler: async (request, response) => {
    const { id } = request.params
    const gallery = GalleryModel()

    try {
      request.data = (await gallery.fetch(id)).get()

      if (!request.data) {
        notFoundHandler(response)
      } else {
        response.send(request.data)
      }
    } catch (error) {
      catchHandler(response, error)
    }
  }
}

export default async (App) => {
  App.addHook('onRequest', cache.setupCacheHook)
  App.addHook('preHandler', cache.readCacheHook)
  App.addHook('onResponse', cache.writeCacheHook)
  App.route(getAlbumController)
  App.route(getGalleryController)
}

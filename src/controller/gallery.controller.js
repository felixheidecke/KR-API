import { catchHandler, sendNotFoundHandler } from '#utils/controller'
import * as cache from '#hooks/cache'
import { getAlbum } from '#data/album'
import { getGallery } from '#data/gallery'

const routeTemplate = {
  method: 'GET',
  onRequest: cache.onRequest,
  preHandler: cache.preHandler,
  onResponse: cache.onResponse
}

const getAlbumController = {
  ...routeTemplate,
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

    try {
      const album = await getAlbum(id)
      request.data = album.get()

      if (!request.data) {
        sendNotFoundHandler(response)
      } else {
        response.send(request.data)
      }
    } catch (error) {
      catchHandler(response, error)
    }
  }
}

const getGalleryController = {
  ...routeTemplate,

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

    try {
      const gallery = await getGallery(id)
      request.data = gallery.get()

      if (!request.data) {
        sendNotFoundHandler(response)
      } else {
        response.send(request.data)
      }
    } catch (error) {
      catchHandler(response, error)
    }
  }
}

export default async (App) => {
  App.route(getAlbumController)
  App.route(getGalleryController)
}

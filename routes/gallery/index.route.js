import cache from '#hooks/cache'
// import { getAlbum, getAlbumPhotos, getGallery } from '#data/gallery'
import { Gallery } from '#data/gallery'

export default async (App) => {
  App.route({
    method: 'GET',

    url: '/gallery/:module',

    onRequest: cache.onRequest,

    preHandler: cache.preHandler,

    /**
     * Fetch gallery with images by module (id)
     *
     * @param {object} request Fastify request object
     * @param {object} response Fastify response object
     * @returns {Promise<void>}
     */

    handler: async (request, response) => {
      // Request params
      const { module } = request.params

      try {
        const gallery = new Gallery(module)
        const albums = await gallery.get()

        if (!albums) {
          response.code(404).send({ message: `No gallery found for id ${id}` })
        }

        response.send(albums)
        request.cache.data = albums
        request.cache.shouldSave = true
      } catch (error) {
        console.error(error)
        response.code(500).send(error)
      }
    },

    onResponse: cache.onResponse
  })
}

import cache from '#hooks/cache'
import { getGallery, getGalleryPhotos } from '#data/gallery'

export default async (App) => {
  App.route({
    method: 'GET',

    url: '/gallery/:id',

    onRequest: cache.onRequest,

    preHandler: cache.preHandler,

    /**
     * Fetch gallery with images by id (id)
     *
     * @param {object} request Fastify request object
     * @param {object} response Fastify response object
     * @returns {Promise<void>}
     */

    handler: async (request, response) => {
      // Request params
      const { id } = request.params

      try {
        const gallery = await getGallery(id)
        const photos = (await getGalleryPhotos(id)) || []

        if (!gallery) {
          response.code(404).send({ message: `No gallery found for id ${id}` })
        }

        // Add photos to gallery
        gallery.photos = photos

        response.send(gallery)
        request.cache.data = gallery
        request.cache.shouldSave = true
      } catch (error) {
        console.error(error)
        response.code(500).send(error)
      }
    },

    onResponse: cache.onResponse
  })
}

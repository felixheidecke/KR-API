import cache from '#hooks/cache'
import { Gallery } from '#data/gallery'

export default async (App) => {
  App.route({
    method: 'GET',

    url: '/gallery/album/:id',

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
        const gallery = new Gallery(id, 'album')
        const album = await gallery.get()

        if (!album) {
          response.code(404).send({ message: `No gallery found for id ${id}` })
        }

        response.send(album)
        request.cache.data = album
        request.cache.shouldSave = true
      } catch (error) {
        console.error(error)
        response.code(500).send(error)
      }
    },

    onResponse: cache.onResponse
  })
}

import { GalleryService } from '../services/gallery-service.js'
import { getAlbumRequestSchema } from '../schemas/album-schema.js'
import { getGalleryRequestSchema } from '../schemas/gallery-schema.js'

// --- [ Types ] -----------------------------------------------------------------------------------

import type { FastifyInstance } from 'fastify'
import type { InferFastifyRequest } from '#libs/fastify.js'
import type { z } from 'zod'

type GetGalleryRequestSchema = InferFastifyRequest<z.infer<typeof getGalleryRequestSchema>>
type GetAlbumRequestSchema = InferFastifyRequest<z.infer<typeof getAlbumRequestSchema>>

// --- [ Controller ] ------------------------------------------------------------------------------

export default async function (App: FastifyInstance) {
  /**
   * GET route to retrieve a gallery based on a module parameter.
   * Validates request using 'GetGalleryRequestSchema'.
   *
   * @param {string} '/gallery/:module' - Endpoint to get a gallery for a specific module.
   * @param {object} options - Route configuration object.
   * @param {Function} options.preValidation - Pre-validation function using 'GetGalleryRequestSchema'.
   * @param {Function} options.handler - Async handler function for the route.
   */

  App.get('/gallery/:module', {
    preValidation: async (request: GetGalleryRequestSchema) => {
      const { params } = getGalleryRequestSchema.parse(request)

      request.params = params
    },
    handler: async (request, reply) => {
      const { params } = request
      const gallery = await GalleryService.getGallery(params.module)

      request.data = gallery.map(album => album.display())

      reply.send(request.data)
    }
  })

  /**
   * GET route to retrieve a specific album in a gallery based on module and id.
   * Validates request using 'GetAlbumRequestSchema'.
   *
   * @param {string} '/gallery/:module/:id' - Endpoint to get a specific album in a gallery.
   * @param {object} options - Route configuration object.
   * @param {Function} options.preValidation - Pre-validation function using 'GetAlbumRequestSchema'.
   * @param {Function} options.handler - Async handler function for the route.
   */

  App.get('/gallery/:module/:id', {
    preValidation: async (request: GetAlbumRequestSchema) => {
      const { params } = getAlbumRequestSchema.parse(request)

      request.params = params
    },
    handler: async (request, reply) => {
      const { module, id } = request.params
      const album = await GalleryService.getAlbum(module, id)

      request.data = album.display()

      reply.send(request.data)
    }
  })
}

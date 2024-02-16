import { GalleryInteractor } from '../services/GalleryService.js'
import { getAlbumRequestSchema } from '../schemas/getAlbumRequestSchema.js'
import { getGalleryRequestSchema } from '../schemas/getGalleryRequestSchema.js'

import type { FastifyInstance } from 'fastify'
import type { GetAlbumRequestSchema } from '../schemas/getAlbumRequestSchema.js'
import type { GetGalleryRequestSchema } from '../schemas/getGalleryRequestSchema.js'
import type { InferFastifyRequest } from '../../../common/types/InferFastifyRequest.js'

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
    preValidation: async (request: InferFastifyRequest<GetGalleryRequestSchema>) => {
      const { params, query } = getGalleryRequestSchema.parse(request)
      request.params = params
      request.query = query
    },
    handler: async (request, reply) => {
      const { params, query } = request

      const gallery = await GalleryInteractor.getGallery(params.module, query.detailLevel)
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
    preValidation: async (request: InferFastifyRequest<GetAlbumRequestSchema>) => {
      const { params } = getAlbumRequestSchema.parse(request)
      request.params = params
    },
    handler: async (request, reply) => {
      const { module, id } = request.params
      const album = await GalleryInteractor.getAlbum(module, id)
      request.data = album.display()

      reply.send(request.data)
    }
  })
}

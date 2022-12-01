import { getGallery, getAlbum } from '#data/gallery'
import { catchHandler, sendNotFoundHandler } from '#utils/controller'

/**
 * Fetch gallery with images by module (id)
 *
 * @param {object} request Fastify request object
 * @param {object} response Fastify response object
 * @returns {Promise<void>}
 */

export const getGalleryController = async (request, response) => {
  const { id } = request.params

  try {
    request.data = await getGallery(id)

    if (!request.data) {
      sendNotFoundHandler(response)
    } else {
      response.send(request.data)
    }
  } catch (error) {
    catchHandler(response, error)
  }
}

/**
 * Fetch gallery with images by id (id)
 *
 * @param {object} request Fastify request object
 * @param {object} response Fastify response object
 * @returns {Promise<void>}
 */

export const getAlbumController = async (request, response) => {
  const { id } = request.params

  try {
    request.data = await getAlbum(id)

    if (!request.data) {
      sendNotFoundHandler(response)
    } else {
      response.send(request.data)
    }
  } catch (error) {
    catchHandler(response, error)
  }
}

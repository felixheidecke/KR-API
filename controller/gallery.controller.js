import { getGallery, getAlbum } from '#data/gallery'
import { catchHandler, sendHandler } from '#utils/controller.helper'

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
    const gallery = await getGallery(id)

    sendHandler(response, request, gallery)
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
    const album = await getAlbum(id)

    sendHandler(response, request, album)
  } catch (error) {
    catchHandler(response, error)
  }
}

import { HEADER, MIME_TYPE } from '#constants'

/**
 * Send 404 not found
 * sendNotFoundHandler(response)
 *
 *
 * @param {import('fastify').FastifyReply} response Fastify response object
 * @param {string} message Error message
 */

export const sendNotFoundHandler = (response, message = 'No results found') => {
  response.log.error(message)
  response.header(HEADER.CONTENT_TYPE, MIME_TYPE.TEXT)
  response.code(404).send(message)
}

/**
 * Send 404 not found
 * catchHandler(response, error)
 *
 * @param {import('fastify').FastifyReply} response Fastify response object
 * @param {any} error Error
 */

export const catchHandler = (response, error) => {
  response.log.error(error)
  response.code(500).send({ error })
}

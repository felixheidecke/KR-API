import * as Sentry from '@sentry/node'

/**
 * Send a 404 error
 * notFoundHandler(response, message)
 *
 * @param {import('fastify').FastifyReply} response Fastify response object
 * @param {string} message What do you wan't to tell the world?
 * @returns {void}
 */

export default function notFoundHandler(
  response,
  message = 'Resouce not found'
) {
  const statusCode = 404
  const payload = {
    message,
    error: 'Not Found',
    code: 'NOT_FOUND',
    statusCode
  }

  response.code(statusCode).send(payload)
}

import { uniqueId } from 'lodash-es'

/**
 * Send a 500 error
 * catchHandler(response, error, message)
 *
 * @param {import('fastify').FastifyReply} response Fastify response object
 * @param {Error} error The actual Error
 * @param {string} message An Error occured.
 * @param {number} statusCode HTTP status code
 */

export default function catchHandler(
  response,
  error,
  message = 'An Error occured.',
  statusCode = 500
) {
  const date = new Date()
  const id = uniqueId(`ID: ${[date.getMonth(), date.getDate()].join('')}-`)

  response.log.error({
    message: `${error.message} (${id})`,
    stack: error.stack
  })

  response.code(statusCode).send({
    message: `${message} (${id})`,
    error: 'Server Error',
    statusCode
  })
}

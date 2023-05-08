import { uniqueId } from 'lodash-es'

/**
 * Send 404 not found
 * notFoundHandler(response)
 *
 *
 * @param {import('fastify').FastifyReply} response Fastify response object
 * @param {string} message Error message
 */

export const notFoundHandler = (response, message = 'No results found') => {
  const errorCode = uniqueId('error-id-') + new Date().getMilliseconds()

  response.log.error({ message, errorCode })
  response.code(404).send({ message, errorCode })
}

/**
 * Send 404 not found
 * catchHandler(response, error)
 *
 * @param {import('fastify').FastifyReply} response Fastify response object
 * @param {any} error Error
 */

export const catchHandler = (
  response,
  error,
  message = 'An Error occured.'
) => {
  const id = uniqueId('error-id-') + new Date().getMilliseconds()

  response.log.error({
    message: error.message,
    stack: error.stack,
    id
  })

  response.code(500).send({ message, id })
}

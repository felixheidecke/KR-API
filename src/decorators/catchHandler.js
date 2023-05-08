import { uniqueId } from 'lodash-es'

/**
 * Send a 500 error
 * catchHandler(response, error, message)
 *
 * @param {import('fastify').FastifyReply} response Fastify response object
 * @param {Error} error The actual Error
 * @param {string} message An Error occured.
 */

export default function catchHandler(
  response,
  error,
  message = 'An Error occured.'
) {
  const id = uniqueId('error-id-') + new Date().getMilliseconds()

  response.log.error({
    message: error.message,
    stack: error.stack,
    id
  })

  response.code(500).send({ code: 500, id, message })
}

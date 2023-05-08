import { uniqueId } from 'lodash-es'

/**
 * Send a 404 error
 * notFoundHandler(response, message)
 *
 * @param {import('fastify').FastifyReply} response Fastify response object
 * @param {string} message Not Found.
 */

export default function notFoundHandler(response, message = 'Not Found!') {
  const id = uniqueId('error-id-') + new Date().getMilliseconds()

  response.log.error({ message, id })

  response.code(404).send({ code: 404, id, message })
}

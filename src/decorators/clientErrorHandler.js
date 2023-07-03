/**
 * Send a 400 error
 * clientErrorHandler(response, error, message)
 *
 * @param {import('fastify').FastifyReply} response Fastify response object
 * @param {number} statusCode HTTP status code
 * @param {string} config.error Error type
 * @param {string} config.message Error message
 * @param {string} config.payload Data being sent along the errir
 */

export default function clientErrorHandler(response, statusCode = 400, config) {
  response.code(statusCode).send({
    message: config.message || 'An Error occured.',
    error: config.error || 'Bad Request',
    code: config.code,
    statusCode,
    payload: config.payload
  })
}

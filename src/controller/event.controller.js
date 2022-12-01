import { getEvent, getEvents } from '#data/events'
import { catchHandler, sendNotFoundHandler } from '#utils/controller'

/**
 * @param {import("fastify").FastifyRequest} request Fastify request object
 * @param {import("fastify").FastifyReply} response Fastify response object
 */

export const getEventController = async (request, response) => {
  // Request params
  const { id } = request.params

  console.log('getEventController', request.cache.shouldSave)

  try {
    request.data = await getEvent(id)

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
 * @param {import("fastify").FastifyRequest} request Fastify request object
 * @param {import("fastify").FastifyReply} response Fastify response object
 */

export const getEventsController = async (request, response) => {
  const { id } = request.params // is module
  const { query } = request

  try {
    request.data = await getEvents(id, query)

    if (!request.data) {
      sendNotFoundHandler(response)
    } else {
      response.send(request.data)
    }
  } catch (error) {
    catchHandler(response, error)
  }
}

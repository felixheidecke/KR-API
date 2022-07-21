import cache from '#hooks/cache';
import { getEventById } from '#data/events';

export default async (App) => {
  App.route({
    method: 'GET',

    url: '/event/:id',

    schema: {
      params: {
        type: 'object',
        properties: {
          limit: {
            type: 'number'
          }
        }
      }
    },

    onRequest: cache.onRequest,

    preHandler: cache.preHandler,

    /**
     * Getting article by id
     *
     * @param {object} request Fastify request object
     * @param {object} response Fastify response object
     * @returns {Promise<void>}
     */

    handler: async (request, response) => {

      const { id } = request.params;

      if (request.cache.data) {
        response.send(request.cache.data);
        return;
      }

      try {
        const event = await getEventById(id);

        if (!event) {
          response.code(400).send({ error: `No event found for id ${id}` });
        } else {
          response.send(event);
          request.cache.data = event;
          request.cache.shouldSave = false;
        }
      } catch (error) {
        console.error({ error });
        response.code(500).send({ error: 'Internal Server Error!' });
      }
    },

    onResponse: cache.onResponse
  });
};

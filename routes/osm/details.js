import cache from '#hooks/cache';
import getDetails from '#data/osm-details';

export default async (App) => {
  App.route({
    method: 'GET',

    url: '/osm/details/:id',

    schema: {
      params: {
        type: 'object',
        properties: {
          id: {
            type: 'number'
          }
        }
      }
    },

    onRequest: async (request) => {
      return cache.onRequest(request, { ttl: 60 })
    },

    preHandler: cache.preHandler,

    /**
     * Getting articles by their module (id)
     *
     * @param {object} request Fastify request object
     * @param {object} response Fastify response object
     * @returns {Promise<void>}
     */

    handler: async (request, response) => {
      // Request params
      const { id } = request.params;

      if (request.cache.data) {
        response.send(request.cache.data);
        return;
      }

      try {
        const data = await getDetails(id);

        response.send(data);
        request.cache.data = data;
        request.cache.shouldSave = true;
      } catch (error) {
        console.error({ error });
        response.code(500).send({ error: 'Internal Server Error!' });
      }
    },

    onResponse: cache.onResponse
  });
};

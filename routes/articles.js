import cache from '#hooks/cache';
import { getArticlesByModule } from '#data/articles';

export default async (App) => {
  App.route({
    method: 'GET',

    url: '/articles/:id',

    schema: {
      params: {
        type: 'object',
        properties: {
          id: {
            type: 'number'
          }
        }
      },
      query: {
        type: 'object',
        properties: {
          limit: {
            type: 'number'
          },
          expanded: {
            type: 'boolean'
          }
        }
      }
    },

    onRequest: cache.onRequest,

    preHandler: cache.preHandler,

    /**
     * Getting a single article by its _id
     *
     * @param {object} request Fastify request object
     * @param {object} response Fastify response object
     * @returns {Promise<void>}
     */

    handler: async (request, response) => {
      // Request params
      const { id } = request.params;
      const { limit, expanded } = request.query;

      if (request.cache.data) {
        response.send(request.cache.data);
        return;
      }

      try {
        const articles = await getArticlesByModule(id, { expanded, limit });

        if (!articles) {
          response.code(400).send({ error: `No articles found for id ${id}` });
        } else {
          response.send(articles);

          request.cache.data = articles;
          request.cache.shouldSave = true;
        }
      } catch (error) {
        console.error({ error });
        response.code(500).send({ error: 'Internal Server Error!' });
      }
    },

    onResponse: cache.onResponse
  });
};

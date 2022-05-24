import { getArticlesByModule } from '#libs/articles';

// Hooks
import { handler as authHandler, schema as authSchema } from '#hooks/authentication';

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
          limit: { type: 'number' }
        }
      },
      ...authSchema
    },

    // --- Authentication required --------------------------------------------
    onRequest: authHandler,

    // --- Fetch articles -----------------------------------------------------
    async handler({ params, query }, response) {
      try {
        const articles = await getArticlesByModule(params.id, query.limit);

        if (!articles) {
          response.code(400).send({ error: `No articles found for id ${params.id}` });
        } else {
          response.send(articles);
        }
      } catch (error) {
        console.error({ error });
        response.code(500).send({ error: 'Internal Server Error!' });
      }
    }
  });
};

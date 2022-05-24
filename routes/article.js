import { getArticleById } from '#libs/articles';

// Hooks
import { handler as authHandler, schema as authSchema } from '#hooks/authentication';

export default async (App) => {
  App.route({
    method: 'GET',

    url: '/article/:id',

    schema: {
      params: {
        type: 'object',
        properties: {
          id: {
            type: 'number'
          }
        }
      },
      ...authSchema
    },

    // --- Authentication required --------------------------------------------
    onRequest: authHandler,

    // --- Fetch articles -----------------------------------------------------
    async handler({ params }, response) {
      try {
        const article = await getArticleById(params.id);

        if (!article) {
          response.code(400).send({ error: `No article found for id ${params.id}` });
        } else {
          response.send(article);
        }
      } catch (error) {
        console.error({ error });
        response.code(500).send({ error: 'Internal Server Error!' });
      }
    }
  });
};

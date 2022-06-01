export default async (App) => {
  App.route({
    method: 'POST',
    url: '/form',

    schema: {
      body: {
        type: 'object',
        required: ['id', 'subject', 'required'],
        properties: {
          recipient: { type: 'number' },
          subject: { type: 'string' },
          required: { type: 'array' }
        }
      }
    },

    onRequest: async (_, response) => {
      response.headers({
        [HEADER.CONTENT_TYPE]: MIME_TYPE_JSON,
        [HEADER.CACHE_CONTROL]: [HEADER.PRIVATE, HEADER.NO_STORE].join(', ')
      });
    },

    preValidation: async (request, _) => {
      request.body = {
        ...request.body,
        required: JSON.parse(request.body.required)
      };
    },

    preHandler: async ({ body }, response) => {
      const missing =
        body.required.filter((field) => !body[field].length) || [];

      try {
        if (!missing.length) return;

        response.code(400).send({
          message: 'Missing required fields',
          fields: missing
        });
      } catch (error) {
        console.error('[KR-API]', error);
        response.code(500).send({ error });
      }
    },

    handler: async ({ body }, response) => {
      // Get corresponding email from databse
      try {
        const [result] = await database.execute(
          `SELECT email FROM Formmail WHERE ID = ?`,
          [body.id]
        );

        if (!result.length) {
          response
            .code(400)
            .send({ message: `No entry found for id ${body.id}` });
        }

        mailer.sendMail({
          from,
          to: result[0].email,
          subject: body.subject,
          text: jsonToText(omit(body, ['id', 'subject', 'required']))
        });

        // Don't wait for
        response.code(202).send({ message: 'success' });
      } catch (error) {
        console.error({ error });
        response.code(500).send({ error: 'Internal Server Error!' });
      }
    }
  });
};

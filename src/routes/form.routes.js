import { cacheNoStore as cacheNoStoreHandler } from '#hooks/header'
import { formController, requiredFieldsController } from '#controller/form'

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
      },
      query: {
        type: 'object',
        properties: {
          attach: { type: 'string' }
        }
      }
    },

    onRequest: cacheNoStoreHandler,

    preValidation: async (request, _) => {
      request.body = {
        ...request.body,
        id: request.body?.id.split(',').map((id) => +id),
        required: request.body?.required.split(',')
      }
    },

    preHandler: requiredFieldsController,

    handler: formController
  })
}

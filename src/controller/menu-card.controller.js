import * as cache from '#hooks/cache'
import { getMenuByModule } from '#data/menu-card'

const menuCardController = {
  method: 'GET',

  url: '/menu-card/:id',

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

  onRequest: cache.onRequest,

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
    const { id } = request.params

    if (request.data) {
      response.send(request.data)
      return
    }

    try {
      const article = await getMenuByModule(id)

      if (!article) {
        response.code(400).send({ error: `No menu found for id ${id}` })
      } else {
        response.send(article)
        request.data = article
        request.cache.shouldSave = true
      }
    } catch (error) {
      console.error({ error })
      response.code(500).send({ error: 'Internal Server Error!' })
    }
  },

  onResponse: cache.onResponse
}

export default async (App) => {
  App.route(menuCardController)
}

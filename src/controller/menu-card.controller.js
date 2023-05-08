// import * as cache from '#src/hooks/cacheHooks'
import MenuCard from '#model/menuCard.model'

const method = 'GET'
const url = '/menu-card/:id'
const schema = {
  params: {
    type: 'object',
    properties: {
      id: {
        type: 'number'
      }
    }
  }
}

/**
 * Getting articles by their module (id)
 *
 * @param {object} request Fastify request object
 * @param {object} response Fastify response object
 * @returns {Promise<void>}
 */

async function handler(request, response) {
  const { id } = request.params
  const menuCardModel = new MenuCard()

  try {
    await menuCardModel.fetch(id)

    if (menuCardModel.hasData) {
      request.data = menuCardModel.data
      response.send(request.data)
    } else {
      this.notFoundHandler(response, `Menu Card ${id} not found!`)
    }
  } catch (error) {
    this.catchHandler(response, error)
  }
}

export default async (App) => {
  App.route({ method, url, schema, handler })
}

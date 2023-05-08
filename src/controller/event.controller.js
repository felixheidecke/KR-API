// import cacheHooks from '#hooks/cacheHooks.js'
import Event from '#model/event.model'

const method = 'GET'
const url = '/event/:id'
const schema = {
  params: {
    type: 'object',
    required: ['id'],
    properties: {
      id: { type: 'number' }
    }
  },
  query: {
    type: 'object',
    properties: {
      parts: {
        type: 'array',
        default: 'images'
      }
    }
  }
}

async function handler(request, response) {
  const { id } = request.params
  const { parts } = request.query
  const eventModel = new Event()
  const eventConfig = { parts }

  try {
    await eventModel.load(id, eventConfig)

    if (eventModel.hasData) {
      request.data = eventModel.data
      response.send(request.data)
    } else {
      this.notFoundHandler(response, `Event ${id} not found!`)
    }
  } catch (error) {
    this.catchHandler(response, error)
  }
}

export default async (App) => {
  App.route({ method, url, schema, handler })
}

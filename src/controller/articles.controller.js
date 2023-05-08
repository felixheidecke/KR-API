import Articles from '#model/articles.model'
import { pick } from 'lodash-es'

const method = 'GET'
const url = '/articles/:module'
const schema = {
  params: {
    type: 'object',
    required: ['module'],
    properties: {
      module: { type: 'number' }
    }
  },
  query: {
    type: 'object',
    properties: {
      status: {
        type: 'string',
        enum: ['live', 'archived'],
        default: 'live'
      },
      parts: {
        type: 'string',
        enum: ['content'],
        default: 'content'
      },
      limit: {
        type: 'number'
      }
    }
  }
}

async function handler(request, response) {
  const articlesConfig = pick(request.query, ['status', 'limit', 'parts'])
  const articlesModel = new Articles()

  try {
    await articlesModel.load(request.params.module, articlesConfig)

    if (articlesModel.length) {
      request.data = articlesModel.data

      response.send(request.data)
    } else {
      response.code(404).send({ message: 'Articles not found.' })
    }
  } catch (error) {
    this.catchHandler(response, error.stack + error.message)
  }
}

export default async (App) => {
  App.route({ method, url, schema, handler })
}

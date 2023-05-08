// import * as cacheHooks from '#src/hooks/cacheHooks'
import Article from '#model/article.model'

const method = 'GET'
const url = '/article/:id'
const schema = {
  params: {
    type: 'object',
    required: ['id'],
    properties: {
      id: { type: 'number' }
    }
  }
}

async function handler(request, response) {
  const articleId = request.params.id
  const articleModel = new Article()

  try {
    await articleModel.load(articleId)

    if (articleModel.hasData) {
      request.data = articleModel.data

      response.send(request.data)
    } else {
      this.notFoundHandler({ message: `Article ${articleId} not found!` })
    }
  } catch (error) {
    this.catchHandler(response, error)
  }
}

export default async (App) => {
  App.route({ method, url, schema, handler })
}

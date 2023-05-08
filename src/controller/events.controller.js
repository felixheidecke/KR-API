// import cacheHooks from '#hooks/cacheHooks.js'
import { pick } from 'lodash-es'
import valiDate from '#helper/vali-date'
import Events from '#model/events.model'

const method = 'GET'
const url = '/events/:module'
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
      parts: {
        type: 'array',
        default: 'images'
      },
      limit: {
        type: 'number'
      },
      startsAfter: {
        type: 'string'
      },
      startsBefore: {
        type: 'string'
      },
      endsAfter: {
        type: 'string'
      },
      endsBefore: {
        type: 'string'
      }
    }
  }
}

async function preValidation(request, response) {
  const { query } = request
  const invalidDates = []

  if (query.startsAfter && !valiDate(query.startsAfter)) {
    invalidDates.push('startsAfter')
  }

  if (query.startsBefore && !valiDate(query.startsBefore)) {
    invalidDates.push('startsBefore')
  }

  if (query.endsAfter && !valiDate(query.endsAfter)) {
    invalidDates.push('endsAfter')
  }

  if (query.endsBefore && !valiDate(query.endsBefore)) {
    invalidDates.push('endsBefore')
  }

  if (invalidDates.length) {
    response
      .code(400)
      .send({ error: `Invalid Date format in ${invalidDates.join(', ')}` })
  }
}

async function handler(request, response) {
  const eventsModel = new Events()
  const eventsModule = request.params.module
  const eventsConfig = pick(request.query, [
    'endsAfter',
    'endsBefore',
    'limit',
    'startsAfter',
    'startsBefore',
    'parts'
  ])

  try {
    await eventsModel.load(eventsModule, eventsConfig)

    if (eventsModel.hasData) {
      request.data = eventsModel.data

      response.send(request.data)
    } else {
      this.notFoundHandler(response, `Events ${eventsModule} not found!`)
    }
  } catch (error) {
    this.catchHandler(response, error)
  }
}

export default async (App) => {
  App.route({ method, url, schema, preValidation, handler })
}

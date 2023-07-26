import * as caching from '#hooks/cacheHooks'
import Event from '#model/eventModel'
import Events from '#model/eventsModel'
import valiDate from '#utils/vali-date'

export default async function (App) {
  App.addHook('onRequest', caching.setupCacheHook)
  App.addHook('preHandler', caching.readCacheHook)
  App.addHook('onResponse', caching.writeCacheHook)

  /**
   * Return a single event based on it's id
   */

  App.get('/event/:id', {
    schema: {
      params: {
        type: 'object',
        required: ['id'],
        properties: {
          id: { type: 'number' }
        }
      }
    },
    handler: async function (request, response) {
      const { params } = request
      const event = new Event(params.id)

      await event.load({ parts: 'images,flags' })

      if (event.exists) {
        request.data = event.data

        response.send(request.data)
      } else {
        App.notFoundHandler(response, 'Event not found')
      }
    }
  })

  /**
   * Return multiple events based on the module id
   */

  App.get('/events/:module', {
    schema: {
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
            type: 'string'
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
    },
    preValidation: async function (request, response) {
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
    },
    handler: async function (request, response) {
      const { params, query } = request
      const events = new Events(params.module)

      await events.load(query)

      if (events.exists) {
        request.data = events.data

        response.send(request.data)
      } else {
        App.notFoundHandler(response, 'Events not found')
      }
    }
  })
}

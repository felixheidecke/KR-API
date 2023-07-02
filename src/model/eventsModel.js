import { getUnixTime } from 'date-fns'
import { pick } from 'lodash-es'
import database from '#libs/database'
import Event from '#model/eventModel'
import SimpleQuery from '#libs/simple-query-builder'

export default class Events {
  #module

  // Data
  #events = []

  constructor(module) {
    if (!module) {
      throw new Error('Missing required parameter "module"')
    }

    this.#module = module
  }

  get data() {
    return this.#events.map(({ data }) => data)
  }

  get length() {
    return this.#events.length
  }

  async load(config = {}) {
    const eventsConfig = pick(config, [
      'startsBefore',
      'startsAfter',
      'endsBefore',
      'endsAfter',
      'limit'
    ])

    const importEvents =
      (await Events.fetchEvents(this.#module, eventsConfig)) || []

    this.#events =
      (await Promise.all(
        importEvents.map(async (_event) => {
          const importEvent = new Event()
          const importPayload = { event: importEvent }

          if (config.parts?.includes('images')) {
            importPayload.images =
              (await Event.fetchImages(importEvent._id)) || []
          }

          if (config.parts?.includes('flags') && importEvent.flagset) {
            importPayload.flags =
              (await Event.fetchFlags(importEvent.flagset)) || []
          }

          importEvent.import(importPayload)

          return importEvent
        })
      )) || []

    return this
  }

  static async fetchEvents(
    module,
    { startsBefore, startsAfter, endsBefore, endsAfter, limit }
  ) {
    if (!module) {
      throw new Error('Missing mandatory attribute { module }')
    }

    const sql = new SimpleQuery()
      .select('*')
      .from('rtd.Event')
      .where(['module =', module])

    if (startsBefore) {
      sql.and(['startDate <', getUnixTime(new Date(startsBefore))])
    }

    if (startsAfter) {
      sql.and(['startDate >', getUnixTime(new Date(startsAfter))])
    }

    if (endsBefore) {
      sql.and(['endDate <', getUnixTime(new Date(endsBefore))])
    }

    if (endsAfter) {
      sql.and(['endDate >', getUnixTime(new Date(endsAfter))])
    }

    sql.order('startDate', 'asc')

    if (limit) {
      sql.limit(limit)
    }

    const [rows] = await database.execute(sql.query)

    return rows.length ? rows : null
  }

  import({ events }) {
    this.#events = events

    return this
  }

  export() {
    return {
      events: this.#events
    }
  }

  from(events) {
    if (events.name !== 'Events') return

    this.import(events.export())
  }
}

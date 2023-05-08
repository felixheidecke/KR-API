import SimpleQuery from '#libs/simple-query-builder'
import database from '#libs/database'
import { getUnixTime } from 'date-fns'
import Event from '#model/event.model'

export default class Events {
  #events = []

  async load(module, config) {
    const query = new SimpleQuery()

    query.select('_id').from('rtd.Event').where(['module =', module])

    if (config.startsBefore) {
      query.and(['startDate <', getUnixTime(new Date(config.startsBefore))])
    }

    if (config.startsAfter) {
      query.and(['startDate >', getUnixTime(new Date(config.startsAfter))])
    }

    if (config.endsBefore) {
      query.and(['endDate <', getUnixTime(new Date(config.endsBefore))])
    }

    if (config.endsAfter) {
      query.and(['endDate >', getUnixTime(new Date(config.endsAfter))])
    }

    query.order('startDate', 'asc')

    if (config.limit) {
      query.limit(config.limit)
    }

    const [rows] = await database.execute(query.query)

    if (!rows.length) return this

    this.#events = await Promise.all(
      rows.map(async ({ _id }) => {
        const event = new Event()

        await event.load(_id, { parts: config.parts })

        return event.data
      })
    )

    return this
  }

  get data() {
    return [...this.#events]
  }

  get hasData() {
    return !!this.length
  }

  get length() {
    return this.#events.length
  }

  filter(callback) {
    return this.#events.filter(callback)
  }

  find(callback) {
    return this.#events.find(callback)
  }

  map(callback) {
    return this.#events.map(callback)
  }
}

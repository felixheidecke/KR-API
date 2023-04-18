import SimpleQuery from '#libs/simple-query-builder'
import database from '#libs/database'
import { getEvent } from '#data/event'
import { getUnixTime } from 'date-fns'

export async function getEvents(module = 0, config = {}) {
  // --- Data ---

  let events = []

  // --- Initialise ---

  if (module) {
    await fetchEvents()
  }

  async function fetchEvents() {
    const { limit, startsBefore, startsAfter, endsBefore, endsAfter } = config

    const query = new SimpleQuery()

    query.select('_id').from('rtd.Event').where(['module =', module])

    if (startsBefore) {
      query.and(['startDate <', getUnixTime(new Date(startsBefore))])
    }

    if (startsAfter) {
      query.and(['startDate >', getUnixTime(new Date(startsAfter))])
    }

    if (endsBefore) {
      query.and(['endDate <', getUnixTime(new Date(endsBefore))])
    }

    if (endsAfter) {
      query.and(['endDate >', getUnixTime(new Date(endsAfter))])
    }

    query.order('startDate', 'asc')

    if (limit) {
      query.limit(limit)
    }

    const [rows] = await database.execute(query.query)

    if (!rows.length) return

    console.log({ config })

    events = await Promise.all(rows.map(({ _id }) => getEvent(_id)))
  }

  function importData(data) {
    events = data
  }

  return {
    get: (index = -1) => {
      if (index > -1) {
        return events[index]
      }

      return events
    },
    import: importData
  }
}

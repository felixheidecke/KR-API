import SimpleQuery from '#libs/simple-query-builder'
import database from '#libs/database'
import { getEvent } from '#data/event'

export async function getEvents(module = 0, config = {}) {
  // --- Data ---

  let events = []

  // --- Initialise ---

  if (module) {
    await fetchEvents()
  }

  async function fetchEvents() {
    const { limit, full, expired } = config
    const query = new SimpleQuery()

    query.select('_id').from('rtd.Event').where(['module =', module])

    if (!expired) {
      query.and(['endDate >', Date.now() / 1000])
    }

    query.order('startDate')

    if (limit) {
      query.limit(limit)
    }

    const [rows] = await database.execute(query.query)

    if (!rows.length) return

    events = await Promise.all(
      rows.map(({ _id }) => getEvent(_id, { full: !!full }))
    )
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

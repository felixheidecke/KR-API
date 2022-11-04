import { getUnixTime } from 'date-fns'
import mysqlQuery from '#utils/sql-query-builder'
import database from '#libs/database'
import { ASSET_BASE_URL } from '#utils/constants'
import { eventAdapter } from './_utils.js'

/**
 * Get Events by id
 *
 * @param {object} id
 * @returns {Promise<array>} Event
 */

export const getEvents = async (module, options) => {
  const db = new mysqlQuery()

  // --- Build query ------------------

  db.select(
    `
    _id, title, startDate, endDate, description, details, image, thumb,
    imageDescription, pdf, pdfName, pdfTitle, module, flagset, detailsURL, url,
    presenter, lat, lng`
  )
    .from('rtd.Event')
    .where('endDate > ?')
    .and(`module = ?`)
    .order('startDate')

  if (options.limit) {
    db.limit(options.limit)
  }

  try {
    const [rows] = await database.execute(db.query(), [
      getUnixTime(new Date()),
      module
    ])

    if (!rows.length) return []

    return await Promise.all(
      rows.map(async (event) => {
        const normalizedEvent = eventAdapter(event)

        return {
          ...normalizedEvent,
          images: await getImagesByEvent(event._id),
          flags: await getFlags(event.flagset)
        }
      })
    )
  } catch (error) {
    console.error(error)
    return error
  }
}

/**
 * Get Event by id
 *
 * @param {object} id
 * @returns {Promise<object|null>} Event
 */

export const getEvent = async (id) => {
  const db = new mysqlQuery()

  // --- Build query ------------------

  db.select(
    `
    _id, title, startDate, endDate, description,
    details, image, thumb, imageDescription,
    pdf, pdfName, pdfTitle, module, flagset,
    detailsURL, url, presenter, lat, lng`
  )
    .from('rtd.Event')
    .where('_id = ?')

  try {
    const [rows] = await database.execute(db.query(), [id])

    if (!rows.length) return null

    const event = eventAdapter(rows[0])

    return {
      ...event,
      images: await getImagesByEvent(rows[0]._id),
      flags: await getFlags(rows[0].flagset)
    }
  } catch (error) {
    console.error(error)
    return error
  }
}

/**
 * Add further images to event
 *
 * @param {object} id
 * @returns {Promise<object>} enriched article
 */

const getImagesByEvent = async (id) => {
  const db = new mysqlQuery()

  db.select('image, description')
    .from('rtd.EventImage')
    .where('event = ?')
    .order('position')

  try {
    const [rows] = await database.execute(db.query(), [id])

    if (!rows.length) return []

    return rows.map((row) => {
      return {
        src: ASSET_BASE_URL + row.image,
        alt: row.description
      }
    })
  } catch (error) {
    console.error(error)
    return error
  }
}

/**
 * Fetch flags by id
 *
 * @param {number} id
 * @returns {Promise<String[]>} list of flag titles
 */

const getFlags = async (id) => {
  const db = new mysqlQuery()

  try {
    db.select('title').from('rtd.Flag').where('flagset = ?')

    const [rows] = await database.execute(db.query(), [id])

    if (!rows.length) return []

    return rows.map((flag) => flag.title)
  } catch (error) {
    console.error(error)
    return error
  }
}

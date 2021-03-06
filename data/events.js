import textile from 'textile-js'
import slugify from 'slugify'
import { getUnixTime } from 'date-fns'
import { upperFirst } from 'lodash-es'

import mysqlQuery, { orGroup } from '#utils/sql-query-builder'
import database from '#libs/database'
import { ASSET_BASE_URL } from '#utils/constants'
import asyncMap from '#utils/async-map'

export const getEvents = async (options) => {
  const db = new mysqlQuery()

  // --- Build query ------------------

  db.select('*').from('rtd.Event').where('endDate > ?').order('startDate')

  if (options.commune) {
    const commune = [options.commune].flat()
    const communes = commune.map((c) => `commune = '${c}'`)
    db.and(orGroup(communes))
  }

  if (options.module) {
    const module = [options.module].flat()
    const modules = module.map((c) => `module = '${c}'`)
    db.and(orGroup(modules))
  }

  if (options.limit) {
    db.limit(options.limit)
  }

  try {
    const [rows] = await database.execute(db.query(), [getUnixTime(new Date())])

    if (!rows.length) {
      return null
    }

    return asyncMap(rows, async (event) => await eventAdapter(event))
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

/**
 * Remodel the structure of an event
 *
 * @param {object} e Event (from DB)
 * @returns {object} Remodled event
 */

const eventAdapter = async (e) => {
  const slugifyConfig = {
    lower: true,
    remove: /[*+~.,/()'"!?:@]/g
  }

  return {
    id: e._id,
    module: e.module,
    slug: slugify(e.title, slugifyConfig),
    title: e.title,
    starts: e.startDate,
    ends: e.endDate,
    description: e.description ? textile.parse(e.description) : null,
    details: e.details ? textile.parse(e.details) : null,
    image: e.image
      ? {
          src: ASSET_BASE_URL + e.image,
          thumbSrc: e.thumb ? ASSET_BASE_URL + e.thumb : null,
          alt: e.imageDescription || null
        }
      : null,
    pdf: e.pdf
      ? {
          src: ASSET_BASE_URL + e.pdf || null,
          name: e.pdfName || null,
          title: e.pdfTitle ? e.pdfTitle.trim() : e.pdfName
        }
      : null,
    commune: e.commune !== '-' ? upperFirst(e.commune) : null,
    website: e.detailsURL || null,
    organizer: e.presenter || null,
    flags: await getFlags(e.flagset),
    coordinates:
      +e.lat > 0 && +e.lng > 0
        ? {
            lat: +e.lat,
            lng: +e.lng
          }
        : null
  }
}

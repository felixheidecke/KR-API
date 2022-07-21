import textile from 'textile-js'
import slugify from 'slugify'
import { getUnixTime } from 'date-fns'
import { upperFirst } from 'lodash-es'

import mysqlQuery from "#utils/sql-query-builder";
import database from '#libs/database'
import { ASSET_BASE_URL } from '#utils/constants'

export const getEvents = async (options) => {
  const db = new mysqlQuery();
  const { communes, ids, limit, modules } = {
    communes: [],
    ids: [],
    limit: 1000,
    modules: [],
    ...options
  }

  // --- Build query ------------------

  db.select('*')
    .from('rtd.Event')
    .where('endDate < ?')
    .order('startDate')
    .limit(limit)

  ids.forEach(i => (db.or(`_id = "${i}"`)))

  communes.forEach(c => (db.or(`commune = "${c}"`)))

  modules.forEach(m => (db.or(`module = "${m}"`)))

  try {
    const [rows] = await database.execute(db.query(), [getUnixTime(new Date())]);

    if (!rows.length) {
      return null;
    }

    return rows.map(event => eventAdapter(event));
  } catch (error) {
    console.error(error);
    return error;
  }
}

/**
 * Remodel the structure of an event
 *
 * @param {object} e Event (from DB)
 * @returns {object} Remodled event
 */

const eventAdapter = (e) => {
  const slugifyConfig = {
    lower: true,
    remove: /[*+~.,/()'"!?:@]/g
  }

  return {
    id: e._id,
    slug: slugify(e.title, slugifyConfig),
    title: e.title,
    starts: e.startDate,
    ends: e.endDate,
    description: e.description ? textile.parse(e.description) : null,
    details: e.details ? textile.parse(e.details) : null,
    image: e.image
      ? {
        src: ASSET_BASE_URL + e.image,
        thumbSrc: (e.thumb) ? ASSET_BASE_URL + e.thumb : null,
        alt: e.imageDescription || null
      }
      : null,
    pdf: e.pdf
      ? {
        src: ASSET_BASE_URL + e.pdf || null,
        name: e.pdfName || null,
        title: (e.pdfTitle) ? e.pdfTitle.trim() : e.pdfName
      }
      : null,
    commune: e.commune !== '-' ? upperFirst(e.commune) : null,
    website: e.url || null,
    organizer: e.presenter || null,
    coordinates: +e.lat > 0 && +e.lng > 0 ? {
      lat: +e.lat,
      lng: +e.lng
    } : null
  };
};
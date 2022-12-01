import { ASSET_BASE_URL } from '#constants'
import { toUrlSlug } from '#libs/slugify'
import textile from 'textile-js'

// --- Adapter -----------------------------------------------------------------

/**
 * Remodel the structure of an rtd.Event
 *
 * @param {object} e Event
 * @returns {object} Restructured event
 */

export const eventAdapter = (e) => {
  return {
    id: e._id,
    module: e.module,
    slug: toUrlSlug(e.title),
    title: e.title,
    starts: e.startDate,
    ends: e.endDate,
    description: e.description ? textile.parse(e.description) : null,
    details: e.details ? textile.parse(e.details) : null,
    image: e.image
      ? {
          src: ASSET_BASE_URL + e.image,
          thumbSrc: e.thumb ? ASSET_BASE_URL + e.thumb : null,
          alt: e.imageDescription
        }
      : null,
    pdf: e.pdf
      ? {
          src: ASSET_BASE_URL + e.pdf || null,
          name: e.pdfName || null,
          title: e.pdfTitle ? e.pdfTitle.trim() : 'Weitere Infos'
        }
      : null,
    website: e.detailsURL || null,
    ticketshop: e.url || null,
    organizer: e.presenter || null,
    coordinates:
      +e.lat > 0 && +e.lng > 0
        ? {
            lat: +e.lat,
            lng: +e.lng
          }
        : null
  }
}

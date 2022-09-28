import textile from 'textile-js'
import slugify from 'slugify'
import { ASSET_BASE_URL } from '#utils/constants'

/**
 * Remodel the structure of rtd.ArticleParagraph
 *
 * @param {object} p Paragraph
 * @returns {object} Restructured paragraph
 */

export const paragraph = (p) => {
  return {
    id: p._id,
    text: textile.parse(p.text) || null,
    image: p.image
      ? {
        src: ASSET_BASE_URL + p.image,
        alt: p.imageDescription,
        align: p.imageAlign || null
      }
      : null
  }
}


/**
 * Remodel the structure of an rtd.Article
 *
 * @param {object} a Article
 * @returns {object} Restructured article
 */

export const article = (a) => {
  const slugifyConfig = {
    lower: true,
    remove: /[*+~.,/()'"!?:@]/g
  }

  return {
    id: a._id,
    module: a.module,
    slug: slugify(a.title, slugifyConfig),
    title: a.title,
    date: a.date,
    text: textile.parse(a.text) || null,
    image: a.image
      ? {
        src: ASSET_BASE_URL + a.image,
        thumbSrc: a.imageSmall ? ASSET_BASE_URL + a.imageSmall : null,
        alt: a.imageDescription
      }
      : null,
    pdf: a.pdf
      ? {
        src: ASSET_BASE_URL + a.pdf || null,
        name: a.pdfName || null,
        title: a.pdfTitle ? a.pdfTitle.trim() : 'Weitere Infos'
      }
      : null,
    web: a.web || null,
    author: a.author || null
  }
}


/**
 * Remodel the structure of an rtd.Event
 *
 * @param {object} e Event
 * @returns {object} Restructured event
 */

export const event = (e) => {
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

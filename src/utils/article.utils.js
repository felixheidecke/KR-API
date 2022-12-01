import { ASSET_BASE_URL } from '#constants'
import { toUrlSlug } from '#libs/slugify'
import textile from 'textile-js'

// --- Adapter -----------------------------------------------------------------

/**
 * Remodel the structure of rtd.ArticleParagraph
 *
 * @param {object} p Paragraph
 * @returns {object} Restructured paragraph
 */

export const paragraphAdapter = (p) => {
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

export const articleAdapter = (a) => {
  return {
    id: a._id,
    module: a.module,
    slug: toUrlSlug(a.title),
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

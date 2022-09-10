import textile from 'textile-js'
import slugify from 'slugify'

import database from '#libs/database'
import { ASSET_BASE_URL } from '#utils/constants'

/**
 * Fetch article
 *
 * @param {number} id Article id
 * @returns {object|null} Article
 */

export const getArticleById = async (id) => {
  const query = `
  SELECT
    _id, module, title, date,
    text, image, imageSmall, imageDescription,
    pdf, pdfName, pdfTitle, web, author
  FROM
    Article
  WHERE
    _id = ?
  LIMIT
    1`

  try {
    const [rows] = await database.execute(query, [id])

    if (!rows.length) {
      return null
    }

    let article = articleAdapter(rows[0])
    article = await appendContent(article)
    return article
  } catch (error) {
    console.error(error)
    return error
  }
}

/**
 * Fetch articles
 *
 * @param {number} id Module id
 * @returns {object[]|null} Articles
 */

export const getArticlesByModule = async (id, { limit = 500 }) => {
  const query = `
    SELECT
      _id, module, title, date,
      text, image, imageSmall, imageDescription,
      pdf, pdfName, pdfTitle, web, author
    FROM
      Article
    WHERE
      module = ? AND
      active = 1 AND
      date IS NOT NULL AND
      (archiveDate = 0 OR archiveDate > ?)
    ORDER BY
      date DESC
    LIMIT
      ?`

  try {
    const [rows] = await database.execute(query, [id, Date.now(), limit])

    console.log(rows)

    if (!rows.length) {
      return resolve(null)
    }

    return await Promise.all(rows.map(async (article) => await articleAdapter(article)))
  } catch (error) {
    console.error(error)
    return error
  }
}

/**
 * Add content to article
 *
 * @param {object} article
 * @returns {object} enriched article
 */

const appendContent = async (id) => {
  const query = `
  SELECT _id, text, image, imageDescription, imageAlign
    FROM ArticleParagraph
      WHERE
        article = ?
  ORDER BY position`

  try {
    const [rows] = await database.execute(query, [id])

    if (!rows.length) {
      return []
    }

    return rows.map((content) => paragraphAdapter(content))
  } catch (error) {
    console.error(error)
    return error
  }
}

/**
 * Remodel the structure of an article
 *
 * @param {object} a Article (from DB)
 * @returns {object} Remodled article
 */

const articleAdapter = async (a) => {
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
        alt: a.imageDescription || null
      }
      : null,
    pdf: a.pdf
      ? {
        src: ASSET_BASE_URL + a.pdf || null,
        name: a.pdfName || null,
        title: a.pdfTitle ? a.pdfTitle.trim() : 'Weitere Infos'
      }
      : null,
    content: await appendContent(a._id),
    web: a.web || null,
    author: a.author || null
  }
}

/**
 * Remodel the structure of paragraphs
 *
 * @param {object[]} paragraphs List of paragraphs (from DB)
 * @returns {object} Restructured list of paragraphs
 */

export const paragraphAdapter = (p) => {
  return {
    id: p._id,
    text: textile.parse(p.text) || null,
    image: p.image
      ? {
        src: ASSET_BASE_URL + p.image,
        alt: p.imageDescription || null,
        position: p.imageAlign || null
      }
      : null
  }
}

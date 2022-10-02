import database from '#libs/database'
import mysqlQuery from '#utils/sql-query-builder'

import { paragraph as paragraphAdapter, article as articleAdapter } from '#utils/adapter'

/**
 * Fetch article
 *
 * @param {number} id Article id
 * @returns {object|null} Article
 */

export const getArticleById = async (id) => {
  const db = new mysqlQuery()

  db
    .select(`
      _id, module, title, date,
      text, image, imageSmall, imageDescription,
      pdf, pdfName, pdfTitle, web, author`)
    .from('rtd.Article')
    .where('_id = ?')
    .limit(1)

  try {
    const [rows] = await database.execute(db.query(), [id])

    if (!rows.length) {
      return null
    }

    const article = articleAdapter(rows[0])

    return {
      ...article,
      content: await appendContent(rows[0]._id)
    }

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
  const db = new mysqlQuery()

  db
    .select(`
      _id, module, title, date,
      text, image, imageSmall, imageDescription,
      pdf, pdfName, pdfTitle, web, author`)
    .from('rtd.Article')
    .where('module = ?')
    .and('active = 1')
    .and('date IS NOT NULL')
    .and('(archiveDate = 0 OR archiveDate > ?)')
    .order('date')
    .limit('?')

  console.log({ query: db.query() })

  try {
    const [rows] = await database.execute(db.query(), [id, Date.now(), limit])

    if (!rows.length) {
      return resolve(null)
    }

    return await Promise.all(rows.map(async (article) => {
      const normalizedArticle = articleAdapter(article)

      return {
        ...normalizedArticle,
        content: await appendContent(article._id)
      }
    }))
  } catch (error) {
    console.error(error)
    return error
  }
}

/**
 * Fetch content by module id
 *
 * @param {string|number} id article id
 * @returns {object} content
 */

const appendContent = async (id) => {
  const db = new mysqlQuery()

  db
    .select('_id, text, image, imageDescription, imageAlign')
    .from('rtd.ArticleParagraph')
    .where('article = ?')
    .order('position')

  try {
    const [rows] = await database.execute(db.query(), [id])

    if (!rows.length) {
      return []
    }

    return rows.map((content) => paragraphAdapter(content))
  } catch (error) {
    console.error(error)
    return error
  }
}

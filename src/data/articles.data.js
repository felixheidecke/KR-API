import database from '#libs/database'
import mysqlQuery from '#libs/sql-query-builder'
import { articleAdapter, paragraphAdapter } from '#utils/article'

/**
 * Fetch article
 *
 * @param {number} id Article id
 * @returns {Promise<object|null>} Articles
 */

export const getArticleById = async (id) => {
  if (!id) return new Error('Missing required param "id" in getArticleById()')

  const db = new mysqlQuery()

  db.select(
    `
    _id, module, title, date,
    text, image, imageSmall, imageDescription,
    pdf, pdfName, pdfTitle, web, author`
  )
    .from('rtd.Article')
    .where('_id = ?')
    .limit(1)

  try {
    const [rows] = await database.execute(db.query(), [id])

    if (!rows.length) return null

    const article = articleAdapter(rows[0])

    return {
      ...article,
      content: await getParagrapsByArticle(rows[0]._id)
    }
  } catch (error) {
    console.error(error)
    return error
  }
}

/**
 * Fetch Articles
 *
 * @param {number} module
 * @returns {Promise<array>} Articles
 */

export const getArticlesByModule = async (module, { limit = 500 }) => {
  if (!module)
    return new Error('Missing required param "module" in getArticlesByModule()')

  const query = `
    SELECT
      _id, module, title, date, text, image, imageSmall, imageDescription, pdf,
      pdfName, pdfTitle, web, author
    FROM
      rtd.Article
    WHERE
      module = ?
    AND
      date IS NOT NULL
    AND
      (archiveDate = 0 OR archiveDate > ?)
    AND
      active = 1
    ORDER BY
      date ASC
    LIMIT
      ?`

  try {
    const [rows] = await database.execute(query, [module, Date.now(), limit])

    if (!rows.length) return Prmose.resolve([])

    return await Promise.all(
      rows.map(async (article) => {
        const normalizedArticle = articleAdapter(article)

        return {
          ...normalizedArticle,
          content: await getParagrapsByArticle(article._id)
        }
      })
    )
  } catch (error) {
    console.error(error)
    return error
  }
}

/**
 * Fetch Articles by module id
 *
 * @param {string|number} id module
 * @returns {Promise<array>} Articles
 */

const getParagrapsByArticle = async (id) => {
  if (!id)
    return new Error('Missing required param "id" in getParagrapsByArticle()')

  const db = new mysqlQuery()

  db.select('_id, text, image, imageDescription, imageAlign')
    .from('rtd.ArticleParagraph')
    .where('article = ?')
    .order('position')

  try {
    const [rows] = await database.execute(db.query(), [id])

    if (!rows.length) return []

    return rows.map(paragraphAdapter)
  } catch (error) {
    console.error(error)
    return error
  }
}

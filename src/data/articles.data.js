import SimpleQuery from '#libs/simple-query-builder'
import database from '#libs/database'

import { getArticle } from '#data/article'

export async function getArticles(module = 0, config) {
  // --- Data ---

  let articles = []

  // --- Initialise ---

  if (module) {
    await fetchArticles()
  }

  async function fetchArticles() {
    const { archived, inactive, limit, full } = config
    const query = new SimpleQuery()

    query.select('_id').from('rtd.Article').where(`module = ${module}`)

    if (!archived) query.and(`(archiveDate = 0 OR archiveDate > ${Date.now()})`)

    if (inactive) {
      query.and('active = 0')
    } else {
      query.and('active = 1')
    }

    query.order('date')

    if (limit) query.limit(limit)

    const [rows] = await database.execute(query.query)

    if (!rows.length) return

    articles = await Promise.all(
      rows.map(({ _id }) => getArticle(_id, { full: !!full }))
    )
  }

  function get(index = -1) {
    if (!articles.length) {
      return null
    }

    if (index >= 0 && articles.length <= index) {
      return articles[index]
    }

    return articles
  }

  function importData(data) {
    if (!articles.length) {
      throw new Error('Articles already loaded')
    }

    articles = data
  }

  return {
    get,
    import: importData
  }
}

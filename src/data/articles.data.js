import SimpleQuery from '#libs/simple-query-builder'
import database from '#libs/database'

import { getArticle } from '#data/article'

export async function getArticles(module = 0, config = null) {
  config = {
    status: 'live',
    full: true,
    ...config
  }

  // --- [ Data ] --------------------------------------------------------------

  let articles = []

  // --- [ Initialization ] ----------------------------------------------------

  if (module) {
    await fetchArticles()
  }

  // --- [ Methods ] -----------------------------------------------------------

  async function fetchArticles() {
    const { status, full, limit } = config
    const query = new SimpleQuery()

    query
      .select('_id')
      .from('rtd.Article')
      .where(['module =', module])
      .and('active = 1')

    if (status === 'live') {
      query.and(['(archiveDate = 0 OR archiveDate >', Date.now(), ')'])
    } else if (status === 'archived') {
      query.and('archiveDate > 0')
      query.and(['(archiveDate <', Date.now(), ')'])
    }

    query.order('date', 'DESC')

    if (limit) {
      query.limit(limit)
    }

    const [rows] = await database.execute(query.query)

    if (!rows.length) {
      return
    }

    articles = await Promise.all(
      rows.map(({ _id }) => getArticle(_id, { full: !!full }))
    )
  }

  function get(index = -1) {
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

  // --- [ Exports ] -----------------------------------------------------------

  return {
    get,
    import: importData
  }
}

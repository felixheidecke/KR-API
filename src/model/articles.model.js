import SimpleQuery from '#libs/simple-query-builder'
import database from '#libs/database'
import Article from './article.model.js'

export default class Articles {
  #articles = []

  // --- [ Getter ] ------------------------------------------------------------

  get data() {
    return [...this.#articles]
  }

  get hasData() {
    return !!this.length
  }

  get length() {
    return this.#articles.length
  }

  // --- [ Methods ] -----------------------------------------------------------

  async load(module, config) {
    const query = new SimpleQuery()

    query
      .select('_id')
      .from('rtd.Article')
      .where(['module =', module])
      .and('active = 1')

    if (config.status === 'live') {
      query.and(['(archiveDate = 0 OR archiveDate >', Date.now(), ')'])
    } else if (config.status === 'archived') {
      query.and('archiveDate > 0')
      query.and(['(archiveDate <', Date.now(), ')'])
    }

    query.order('date', 'DESC')

    if (config.limit) {
      query.limit(config.limit)
    }

    const [rows] = await database.execute(query.query)

    if (!rows.length) return this

    this.#articles = await Promise.all(
      rows.map(async ({ _id }) => {
        const article = new Article()
        await article.load(_id, { parts: config.parts })

        return article.data
      })
    )

    return this
  }

  filter(callback) {
    return this.#articles.filter(callback)
  }

  find(callback) {
    return this.#articles.find(callback)
  }

  map(callback) {
    return this.#articles.map(callback)
  }
}

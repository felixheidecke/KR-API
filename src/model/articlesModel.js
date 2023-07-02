import Article from './articleModel.js'
import database from '#libs/database'
import SimpleQuery from '#libs/simple-query-builder'

export default class Articles {
  #module

  // Data
  #articles = []

  constructor(module) {
    if (!module) {
      throw new Error('Missing required parameter "module"')
    }

    this.#module = module
  }

  get data() {
    return this.length ? this.#articles.map(({ data }) => data) : undefined
  }

  get length() {
    return this.#articles.length
  }

  async load({ parts, status, limit }) {
    const articles =
      (await Articles.fetchArticles(this.#module, { status, limit })) || []
    const loadContent = parts?.includes('content')

    this.#articles = await Promise.all(
      articles.map(async (article) => {
        const articleModel = new Article(article._id)

        articleModel.import({
          article,
          content: loadContent ? await Article.fetchContent(article._id) : []
        })

        return articleModel
      })
    )

    return this
  }

  static async fetchArticles(module, { status, limit }) {
    const query = new SimpleQuery()
      .select('*')
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

    return rows.length ? rows : null
  }
}

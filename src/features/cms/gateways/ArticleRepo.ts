import knex from '../../../modules/knex.js'
import { head } from 'lodash-es'
import { ArticleContentRepo } from './ArticleContentRepo.js'
import type { Knex } from 'knex'

const DATA_BASE_PATH = 'https://www.rheingau.de/data'

export namespace ArticleRepo {
  export type Article = {
    _id: number
    module: number
    title: string
    date: number
    text?: string
    image?: string
    imageSmall?: string
    imageDescription?: string
    pdf?: string
    pdfName?: string
    pdfTitle?: string
    web?: string
    author?: string
    content?: ArticleContentRepo.ArticleContent[]
  }
}

export class ArticleRepo {
  /**
   * Reads and returns a single article based on the provided module and id.
   *
   * @param {number} module - The module identifier.
   * @param {number} id - The article identifier.
   * @returns {Promise<ArticleRepo.Article | null>} A promise that resolves to an Article object or null if not found.
   */

  public static async readArticle(module: number, id: number): Promise<ArticleRepo.Article | null> {
    const articlesQuery = new RepoArticleBuilder(module)

    await articlesQuery.readOne(id)
    await articlesQuery.withContent()

    return articlesQuery.articles ? (head(articlesQuery.articles) as ArticleRepo.Article) : null
  }

  /**
   * Reads and returns multiple articles based on the provided module and optional query parameters.
   *
   * @param {number} module - The module identifier.
   * @param {object} query - Optional query parameters to filter articles.
   * @param {('live' | 'archived')} query.status - The status filter for the articles.
   * @param {number} query.limit - Limit for the number of articles to retrieve.
   * @returns {Promise<Article[] | null>} A promise that resolves to an array of Article objects or null if the module doesn't exist.
   */

  public static async readArticles(
    module: number,
    query?: {
      archived?: boolean
      limit?: number
      parts?: string[]
    }
  ): Promise<ArticleRepo.Article[] | null> {
    const articlesQuery = new RepoArticleBuilder(module)

    await articlesQuery.isArchived(query?.archived || false).readMany(query?.limit || 1000)

    if ((query?.parts || []).includes('content')) {
      return await articlesQuery.withContent()
    } else {
      return articlesQuery.articles
    }
  }
}

export class RepoArticleBuilder {
  private _query: Knex.QueryBuilder
  private _articles: ArticleRepo.Article[] = []

  constructor(readonly module: number) {
    this._query = knex('Article')
      .select(
        '_id',
        'module',
        'title',
        'date',
        'active',
        'text',
        'image',
        'imageSmall',
        'imageDescription',
        'pdf',
        'pdfName',
        'pdfTitle',
        'web',
        'author'
      )
      .where({ module, active: 1 })
  }

  get query() {
    return this._query
  }

  get articles() {
    if (!this._articles.length) return null

    return [...this._articles.map(this._mapRawArticle)]
  }

  public isArchived(archived: boolean) {
    const now = Math.round(Date.now() / 1000)

    if (archived) {
      this._query.where(function () {
        this.andWhere('archiveDate', '>', 0).andWhere('archiveDate', '<', now)
      })
    } else {
      this._query.where(function () {
        this.andWhere('archiveDate', 0).orWhere('archiveDate', '>', now)
      })
    }

    return this
  }

  public async readMany(limit?: number) {
    this._articles = await this._query.orderBy('date', 'desc').limit(limit ?? 1000)

    return this.articles
  }

  public async readOne(id: number) {
    this._articles = (await this._query.andWhere({ _id: id }).limit(1)) as ArticleRepo.Article[]

    return this.articles ? (head(this.articles) as ArticleRepo.Article) : null
  }

  public async withContent() {
    if (!this._articles.length) {
      throw new Error('No products loaded')
    }

    await Promise.all(
      this._articles.map(async article => {
        article.content = (await ArticleContentRepo.readArticleContent(article._id)) || undefined

        return article
      })
    )

    return this.articles
  }

  private _mapRawArticle(article: ArticleRepo.Article) {
    article.image = DATA_BASE_PATH + '/' + article.image
    article.imageSmall = DATA_BASE_PATH + '/' + article.imageSmall

    return article
  }
}

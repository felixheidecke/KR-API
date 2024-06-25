import { getUnixTime } from 'date-fns'
import { isBoolean } from 'lodash-es'
import { MEDIA_BASE_PATH } from '../../../constants.js'
import knex from '../../../modules/knex.js'

import type { Knex } from 'knex'

export namespace ArticleRepo {
  export type Article = {
    _id: number
    module: number
    title: string
    date: number
    text: string
    image: string
    imageSmall: string
    imageDescription: string
    pdf: string
    pdfName: string
    pdfTitle: string
    web: string
    author: string
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
    return new RepoArticleBuilder(module).readOne(id)
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
    query: {
      createdAfter?: Date
      createdBefore?: Date
      archived?: boolean
      limit?: number
    } = {}
  ): Promise<ArticleRepo.Article[]> {
    return new RepoArticleBuilder(module)
      .created('<', query.createdBefore)
      .created('>', query.createdAfter)
      .isArchived(query.archived)
      .readMany(query.limit)
  }
}

class RepoArticleBuilder {
  private _query: Knex.QueryBuilder

  constructor(readonly module: number) {
    this._query = knex('Article')
      .select(
        '_id',
        'module',
        'title',
        'date',
        'text',
        knex.raw(`IF(image = "", NULL, CONCAT('${MEDIA_BASE_PATH}/', image)) AS image`),
        knex.raw(
          `IF(imageSmall = "", NULL, CONCAT('${MEDIA_BASE_PATH}/', imageSmall)) AS imageSmall`
        ),
        knex.raw('COALESCE(NULLIF(imageDescription, ""), NULL) AS imageDescription'),
        knex.raw(`IF(pdf = "", NULL, CONCAT('${MEDIA_BASE_PATH}/', pdf)) AS pdf`),
        knex.raw('COALESCE(NULLIF(pdfName, ""), NULL) AS pdfName'),
        knex.raw('COALESCE(NULLIF(pdfTitle, ""), NULL, "Weitere Informationen") AS pdfTitle'),
        knex.raw('COALESCE(NULLIF(web, ""), NULL) AS web'),
        knex.raw('COALESCE(NULLIF(author, ""), NULL) AS author')
      )
      .where({ module, active: 1 })
  }

  get query() {
    return this._query
  }

  public isArchived(archived?: boolean) {
    if (!isBoolean(archived)) return this

    const now = Math.round(Date.now() / 1000)

    if (archived) {
      this._query.where(function () {
        this.where('archiveDate', '>', 0).andWhere('archiveDate', '<', now)
      })
    } else {
      this._query.where(function () {
        this.where('archiveDate', 0).orWhere('archiveDate', '>', now)
      })
    }

    return this
  }

  public created(operator: '<' | '<=' | '>' | '>=', date?: Date) {
    if (date) {
      this.query.andWhere('date', operator, getUnixTime(date))
    }

    return this
  }

  public async readMany(limit = 1000): Promise<ArticleRepo.Article[]> {
    return await this._query.orderBy('date', 'desc').limit(limit)
  }

  public async readOne(id: number): Promise<ArticleRepo.Article | null> {
    return this._query.andWhere({ _id: id }).first()
  }
}

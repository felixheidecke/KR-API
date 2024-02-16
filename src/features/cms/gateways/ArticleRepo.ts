import { DetailLevel } from '../../shop/utils/detail-level.js'
import knex from '../../../modules/knex.js'

export type RepoArticle = {
  id: number
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
  content?: RepoArticleContent[]
}

export type RepoArticleContent = {
  id: number
  title: string | null
  text: string
  image: string | null
  imageDescription: string | null
  imageAlign: 'left' | 'right'
}

const DATA_BASE_PATH = 'https://www.rheingau.de/data'

export class ArticleRepository {
  /**
   * Reads and returns a single article based on the provided module and id.
   *
   * @param {number} module - The module identifier.
   * @param {number} id - The article identifier.
   * @returns {Promise<Article | null>} A promise that resolves to an Article object or null if not found.
   */

  public static async readArticle(module: number, id: number): Promise<RepoArticle | null> {
    const [repoArticle, repoArticleContent] = await Promise.all([
      await knex('Article')
        .select(
          '_id as id',
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
        .where({ _id: id, module })
        .first(),
      ArticleRepository.readArticleContent(id)
    ])

    if (!repoArticle) {
      return null
    } else if (repoArticleContent) {
      repoArticle.content = repoArticleContent
    }

    repoArticle.image = DATA_BASE_PATH + '/' + repoArticle.image
    repoArticle.imageSmall = DATA_BASE_PATH + '/' + repoArticle.imageSmall

    return repoArticle
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
      status?: 'live' | 'archived'
      limit?: number
      detailLevel?: DetailLevel
    }
  ): Promise<RepoArticle[] | null> {
    const detailLevel = query?.detailLevel || DetailLevel.DEFAULT
    const now = Math.round(Date.now() / 1000)
    const articlesQuery = knex('Article')

    if (detailLevel === DetailLevel.MINIMAL) {
      articlesQuery.select('_id as id', 'module', 'title', 'date')
    } else {
      articlesQuery.select(
        '_id as id',
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
    }

    articlesQuery.where({ module, active: 1 })

    if (query?.status === 'archived') {
      articlesQuery.where(function () {
        this.where('archiveDate', '>', 0).andWhere('archiveDate', '<', now)
      })
    } else {
      articlesQuery.where(function () {
        this.where('archiveDate', 0).orWhere('archiveDate', '>', now)
      })
    }

    articlesQuery.orderBy('date', 'desc').limit(query?.limit || 1000)

    const repoArticles = await articlesQuery

    if (!repoArticles || !repoArticles.length) {
      return null
    }

    return Promise.all(
      repoArticles.map(async repoArticle => {
        repoArticle.image = repoArticle.image ? DATA_BASE_PATH + '/' + repoArticle.image : ''
        repoArticle.imageSmall = repoArticle.imageSmall
          ? DATA_BASE_PATH + '/' + repoArticle.imageSmall
          : ''

        if (detailLevel === DetailLevel.EXTENDED) {
          const repoArticleContent = await ArticleRepository.readArticleContent(repoArticle.id)

          if (repoArticleContent) {
            repoArticle.content = repoArticleContent
          }
        }
        return repoArticle
      })
    )
  }

  /**
   * Reads and returns the content of a specific article.
   *
   * @param {number} id - The article identifier.
   * @returns {Promise<RepoArticleContent[] | null>} A promise that resolves to an array of article content or null.
   */

  public static async readArticleContent(id: number): Promise<RepoArticleContent[] | null> {
    const repoArticleContent = await knex
      .select('_id as id', 'title', 'text', 'image', 'imageDescription', 'imageAlign')
      .from('ArticleParagraph')
      .where({ article: id })
      .orderBy('position', 'asc')

    return repoArticleContent
      ? repoArticleContent.map(repoArticleEntry => ({
          ...repoArticleEntry,
          image: repoArticleEntry.image ? DATA_BASE_PATH + '/' + repoArticleEntry.image : ''
        }))
      : null
  }
}

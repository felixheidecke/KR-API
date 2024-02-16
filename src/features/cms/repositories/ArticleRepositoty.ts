import { Article } from '../model/Article.js'
import { ArticleContent } from '../model/ArticleContent.js'
import { Image } from '../../../common/entities/Image.js'
import { ModuleRepository } from '../../shop/gateways/ModuleRepository.js'
import knex from '../../../services/knex.js'
import { DetailLevel } from '../../shop/utils/detail-level.js'

type RepositoryArticle = {
  id: number
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
  content?: RepositoryArticleContent[]
}

type RepositoryArticleContent = {
  id: number
  text: string
  image: string
  imageDescription: string
  imageAlign: 'left' | 'right'
}

export class ArticleRepositoty {
  /**
   * Reads and returns a single article based on the provided module and id.
   *
   * @param {number} module - The module identifier.
   * @param {number} id - The article identifier.
   * @returns {Promise<Article | null>} A promise that resolves to an Article object or null if not found.
   */

  public static async readArticle(module: number, id: number): Promise<Article | null> {
    return await knex('Article')
      .select(
        '_id as id',
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
      .first()
      .then(async article => {
        return article
          ? this.createArticleFromRepostitory(module, {
              ...article,
              content: await ArticleRepositoty.readArticleContent(id)
            })
          : null
      })
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
    },
    detailLevel: DetailLevel = 0,
    skipModuleCheck = false
  ): Promise<Article[] | null> {
    if (!skipModuleCheck && !(await ModuleRepository.moduleExists(module))) {
      return null
    }

    const now = Math.round(Date.now() / 1000)
    const articlesQuery = knex('Article')

    if (detailLevel === DetailLevel.MINIMAL) {
      articlesQuery.select('_id as id', 'title', 'date')
    } else {
      articlesQuery.select(
        '_id as id',
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

    const RepositoryArticles = await articlesQuery

    if (detailLevel >= DetailLevel.EXTENDED) {
      return Promise.all(
        RepositoryArticles.map(async article =>
          this.createArticleFromRepostitory(module, {
            ...article,
            content: await ArticleRepositoty.readArticleContent(article.id)
          })
        )
      )
    } else {
      return RepositoryArticles.map(article => {
        return this.createArticleFromRepostitory(module, article)
      })
    }
  }

  /**
   * Reads and returns the content of a specific article.
   *
   * @param {number} id - The article identifier.
   * @returns {Promise<RepositoryArticleContent[] | null>} A promise that resolves to an array of article content or null.
   */

  public static async readArticleContent(id: number): Promise<RepositoryArticleContent[] | null> {
    return (await knex
      .select('_id as id', 'text', 'image', 'imageDescription', 'imageAlign')
      .from('ArticleParagraph')
      .where({ article: id })
      .orderBy('position', 'asc')) as RepositoryArticleContent[] | null
  }

  /**
   * Creates an Article object from a repository article.
   *
   * @param {number} module - The module identifier.
   * @param {RepositoryArticle} raw - The raw article data from the repository.
   * @returns {Article} The constructed Article object.
   */

  private static createArticleFromRepostitory(module: number, raw: RepositoryArticle) {
    const article = new Article(module)

    article.id = raw.id
    article.title = raw.title
    article.date = raw.date
    article.text = raw.text

    if (raw.image) {
      article.image = new Image()
      article.image.alt = raw.imageDescription || ''

      article.image.addSrc(raw.image)

      if (raw.imageSmall) {
        article.image.addSrc(raw.imageSmall, 'small')
      }
    }

    raw.content?.forEach(content => {
      const articleContent = new ArticleContent()

      articleContent.id = content.id
      articleContent.text = content.text

      if (content.image) {
        articleContent.image = new Image()

        articleContent.image.src = content.image
        articleContent.image.alt = content.imageDescription
        articleContent.image.align = content.imageAlign
      }

      article.addContent(articleContent)
    })

    return article
  }
}

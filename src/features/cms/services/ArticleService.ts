import { Article } from '../entities/Article.js'
import { ArticleContent } from '../entities/ArticleContent.js'
import { ArticleRepo } from '../gateways/ArticleRepo.js'
import { Image } from '../../../common/entities/Image.js'
import { PDF } from '../../shop/entities/PDF.js'
import { ModuleRepo } from '../../../common/gateways/ModuleRepo.js'
import { HttpError } from '../../../common/decorators/Error.js'
import type { ArticleContentRepo } from '../gateways/ArticleContentRepo.js'

export class ArticleService {
  /**
   * Retrieves an article by module and ID.
   * @param module - The module of the article.
   * @param id - The ID of the article.
   * @returns The retrieved article.
   * @throws {HttpError} If the article is not found.
   */

  public static async getArticle(
    module: number,
    id: number,
    config: {
      shouldThrow?: boolean
    } = {}
  ) {
    const repoArticle = await ArticleRepo.readArticle(module, id)

    if (!repoArticle && config.shouldThrow) {
      throw HttpError.NOT_FOUND('Article not found.')
    }

    if (!repoArticle) {
      return null
    }

    return utils.createArticleFromRepo(repoArticle)
  }

  /**
   * Retrieves articles based on the specified module and query parameters.
   * @param module - The module number.
   * @param query - Optional query parameters.
   * @param query.status - The status of the articles (e.g., 'archived').
   * @param query.limit - The maximum number of articles to retrieve.
   * @param query.detailLevel - The level of detail for the retrieved articles.
   * @returns An array of articles.
   * @throws {HttpError} If the articles are not found.
   */

  public static async getArticles(
    module: number,
    query?: {
      status?: 'archived'
      limit?: number
      parts?: string[]
    },
    config: {
      skipModuleCheck?: boolean
      shouldThrow?: boolean
    } = {}
  ): Promise<Article[] | null> {
    if (config.shouldThrow && !(await ModuleRepo.moduleExists(module))) {
      throw HttpError.NOT_FOUND('Module not found.')
    }

    const repoArticles = await ArticleRepo.readArticles(module, query)

    return repoArticles ? repoArticles.map(utils.createArticleFromRepo) : []
  }
}

export const utils = {
  /**
   * Creates an Article object from a repo article.
   * @param {number} module - The module identifier.
   * @param {RepoArticle} repoArticle - The raw article data from the repo.
   * @returns {Article} The constructed Article object.
   */

  createArticleFromRepo(repoArticle: ArticleRepo.Article) {
    const article = new Article(repoArticle.module)

    article.id = repoArticle._id
    article.title = repoArticle.title
    article.date = repoArticle.date
    article.text = repoArticle.text
    article.web = repoArticle.web
    article.author = repoArticle.author

    if (repoArticle.image) {
      article.image = new Image()
      article.image.alt = repoArticle.imageDescription || ''

      article.image.addSrc(repoArticle.image)

      if (repoArticle.imageSmall) {
        article.image.addSrc(repoArticle.imageSmall, 'small')
      }
    }

    if (repoArticle.pdf) {
      article.pdf = new PDF(repoArticle.pdf)
      article.pdf.title = repoArticle.pdfTitle || 'Weitere Informationen'
    }

    if (repoArticle.content) {
      article.content = repoArticle.content.map(utils.createArticleContentfromRepo)
    }

    return article
  },

  /**
   * Converts a repo article content object to an article content object.
   * @param {RepoArticleContent} repoArticleContent - The repo article content object to convert.
   * @returns The converted article content object.
   */
  createArticleContentfromRepo(repoArticleContent: ArticleContentRepo.ArticleContent) {
    const articleContent = new ArticleContent()

    articleContent.id = repoArticleContent.id
    articleContent.title = repoArticleContent.title || ''
    articleContent.text = repoArticleContent.text

    if (repoArticleContent.image) {
      articleContent.image = new Image()

      articleContent.image.src = repoArticleContent.image
      articleContent.image.alt = repoArticleContent.imageDescription || ''
      articleContent.image.align = repoArticleContent.imageAlign
    }

    return articleContent
  }
}

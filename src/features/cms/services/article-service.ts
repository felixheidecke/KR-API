import { Article } from '../entities/article.js'
import { ArticleContent } from '../entities/article-content.js'
import { ArticleContentRepo } from '../providers/article-content-repo.js'
import { ArticleRepo } from '../providers/article-repo.js'
import { HttpError } from '#utils/http-error.js'
import { Image } from '#common/entities/image.js'
import { ModuleRepo } from '#common/providers/module-repo.js'
import { PDF } from '#common/entities/pdf.js'
import { omit } from 'lodash-es'

type BaseConfig = {
  skipModuleCheck?: boolean
  shouldThrow?: boolean
}

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
    { skipModuleCheck, shouldThrow }: BaseConfig = {}
  ) {
    const [moduleExists, repoArticle] = await Promise.all([
      skipModuleCheck ? ModuleRepo.moduleExists(module) : Promise.resolve(true),
      ArticleRepo.readArticle(module, id)
    ])

    if (!moduleExists && shouldThrow) {
      throw HttpError.NOT_FOUND('Module not found.')
    }

    if (!repoArticle && shouldThrow) {
      throw HttpError.NOT_FOUND('Article not found.')
    } else if (!repoArticle) {
      return null
    }

    const article = ArticleService.createArticleFromRepo(repoArticle)

    await this.addArticleContent(article)

    return article
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
    query: {
      createdAfter?: Date
      createdBefore?: Date
      archived?: boolean
      limit?: number
      parts?: string[]
    } = {},
    { skipModuleCheck, shouldThrow }: BaseConfig = {}
  ): Promise<Article[] | null> {
    const [moduleExists, repoArticles] = await Promise.all([
      !skipModuleCheck ? ModuleRepo.moduleExists(module) : Promise.resolve(true),
      ArticleRepo.readArticles(module, omit(query, 'parts'))
    ])

    if (!moduleExists && shouldThrow) {
      throw HttpError.NOT_FOUND('Module not found.')
    }

    const articles = repoArticles.map(ArticleService.createArticleFromRepo)

    if (query.parts?.includes('content')) {
      await Promise.all(articles.map(this.addArticleContent))
    }

    return articles
  }

  private static async addArticleContent(article: Article): Promise<void> {
    const repoContent = await ArticleContentRepo.readArticleContent(article.id)

    article.content = repoContent.map(ArticleService.createArticleContentfromRepo)
  }

  /**
   * Creates an Article object from a repo article.
   * @param {number} module - The module identifier.
   * @param {RepoArticle} repoArticle - The raw article data from the repo.
   * @returns {Article} The constructed Article object.
   */

  private static createArticleFromRepo(repoArticle: ArticleRepo.Article) {
    const article = new Article(repoArticle.module)

    article.id = repoArticle._id
    article.title = repoArticle.title
    article.date = repoArticle.date
    article.teaser = repoArticle.text
    article.web = repoArticle.web
    article.author = repoArticle.author

    if (repoArticle.image) {
      article.image = new Image()
      article.image.description = repoArticle.imageDescription

      article.image.addSrc(repoArticle.image)

      if (repoArticle.imageSmall) {
        article.image.addSrc(repoArticle.imageSmall, 'small')
      }
    }

    if (repoArticle.pdf) {
      article.pdf = new PDF(repoArticle.pdf)
      article.pdf.title = repoArticle.pdfTitle || 'Weitere Informationen'
    }

    return article
  }

  /**
   * Converts a repo article content object to an article content object.
   * @param {RepoArticleContent} repoArticleContent - The repo article content object to convert.
   * @returns The converted article content object.
   */
  private static createArticleContentfromRepo(
    repoArticleContent: ArticleContentRepo.ArticleContent
  ) {
    const articleContent = new ArticleContent()

    articleContent.id = repoArticleContent._id
    articleContent.title = repoArticleContent.title || ''
    articleContent.text = repoArticleContent.text

    if (repoArticleContent.image) {
      articleContent.image = new Image()

      articleContent.image.src = repoArticleContent.image
      articleContent.image.description = repoArticleContent.imageDescription || ''
      articleContent.image.align = repoArticleContent.imageAlign
    }

    return articleContent
  }
}

import { de } from 'date-fns/locale'
import { ErrorCodes, ModuleError } from '../../../common/decorators/Error.js'
import type { DetailLevel } from '../../shop/utils/detail-level.js'
import { ArticleRepositoty } from '../repositories/ArticleRepositoty.js'

export class ArticleInteractor {
  public static async getArticle(module: number, id: number) {
    const article = await ArticleRepositoty.readArticle(module, id)

    if (!article) {
      throw new ModuleError('Article not found', ErrorCodes.NOT_FOUND)
    }

    return article
  }

  public static async getArticles(
    module: number,
    query?: {
      status?: 'archived'
      limit?: number
    },
    detailLevel?: DetailLevel
  ) {
    const articles = await ArticleRepositoty.readArticles(module, query, detailLevel)

    if (!articles) {
      throw new ModuleError('Articles not found', ErrorCodes.NOT_FOUND)
    }

    return articles
  }
}

import { DATA_BASE_PATH } from '../../../common/utils/constants.js'
import knex from '../../../modules/knex.js'
export namespace ArticleContentRepo {
  export type ArticleContent = {
    _id: number
    title: string
    text: string
    image: string
    imageDescription: string
    imageAlign: 'left' | 'right'
  }
}

export class ArticleContentRepo {
  /**
   * Reads and returns the content of a specific article.
   *
   * @param {number} id - The article identifier.
   * @returns {Promise<RepoArticleContent[] | null>} A promise that resolves to an array of article content or null.
   */

  public static async readArticleContent(id: number): Promise<ArticleContentRepo.ArticleContent[]> {
    return await knex
      .select(
        '_id',
        knex.raw('CAST(title AS CHAR) as title'),
        'text',
        knex.raw(
          `IF(image IS NULL OR image = '', NULL, CONCAT('${DATA_BASE_PATH}/', image)) AS image`
        ),
        knex.raw('CAST(imageDescription AS CHAR) as imageDescription'),
        knex.raw(`IF(imageAlign IS NULL OR imageAlign = '', 'left', imageAlign) AS imageAlign`)
      )
      .from('ArticleParagraph')
      .where({ article: id })
      .orderBy('position', 'asc')
  }
}

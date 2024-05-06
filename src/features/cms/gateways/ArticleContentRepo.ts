import knex from '../../../modules/knex.js'
export namespace ArticleContentRepo {
  export type ArticleContent = {
    id: number
    title: string | null
    text: string
    image: string | null
    imageDescription: string | null
    imageAlign: 'left' | 'right'
  }
}

const DATA_BASE_PATH = 'https://www.rheingau.de/data'

export class ArticleContentRepo {
  /**
   * Reads and returns the content of a specific article.
   *
   * @param {number} id - The article identifier.
   * @returns {Promise<RepoArticleContent[] | null>} A promise that resolves to an array of article content or null.
   */

  public static async readArticleContent(
    id: number
  ): Promise<ArticleContentRepo.ArticleContent[] | null> {
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

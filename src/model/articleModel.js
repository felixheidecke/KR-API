import { ASSET_BASE_URL } from '#constants'
import { fromUnixTime } from 'date-fns'
import { toUrlSlug } from '#libs/slugify'
import database from '#libs/database'
import SimpleQuery from '#libs/simple-query-builder'
import textile from 'textile-js'

export default class Article {
  #id

  // Data
  #article = {}
  #content = []

  /**
   * @param {number} id id
   */

  constructor(id) {
    if (!id) {
      throw new Error('Missing required parameter "id"')
    }

    this.#id = id
  }

  get id() {
    return this.#article._id
  }

  get module() {
    return this.#article.module
  }

  get slug() {
    return this.title ? toUrlSlug(this.title) : undefined
  }

  get title() {
    return this.#article.title?.trim()
  }

  get date() {
    return this.#article.date
      ? fromUnixTime(this.#article.date).toString()
      : undefined
  }

  get text() {
    return this.#article.text ? textile.parse(this.#article.text) : undefined
  }

  get content() {
    return this.#content.length
      ? this.#content.map(({ text, image, imageDescription, imageAlign }) => ({
          text: text ? textile.parse(text) : undefined,
          image: image
            ? {
                src: ASSET_BASE_URL + image,
                alt: imageDescription || '',
                align: imageAlign || ''
              }
            : undefined
        }))
      : undefined
  }

  get image() {
    const { image, imageSmall, imageDescription } = this.#article

    return image
      ? {
          src: ASSET_BASE_URL + image,
          thumbSrc: imageSmall ? ASSET_BASE_URL + imageSmall : undefined,
          alt: imageDescription || ''
        }
      : undefined
  }

  get pdf() {
    const { pdf, pdfName, pdfTitle } = this.#article

    return pdf
      ? {
          src: ASSET_BASE_URL + pdf,
          name: pdfName || '',
          title: pdfTitle ? pdfTitle.trim() : 'Weitere Infos'
        }
      : undefined
  }

  get website() {
    return this.#article.web?.trim() || undefined
  }

  get author() {
    return this.#article.author?.trim() || undefined
  }

  get exists() {
    return !!this.id
  }

  get data() {
    if (!this.exists) return null

    return {
      id: this.id,
      module: this.module,
      slug: this.slug,
      title: this.title,
      date: this.date,
      text: this.text,
      image: this.image,
      content: this.content,
      pdf: this.pdf,
      website: this.website,
      author: this.author
    }
  }

  async load({ parts }) {
    this.#article = (await Article.fetchArticle(this.#id)) || {}

    if (parts?.includes('content')) {
      this.#content = (await Article.fetchContent(this.#id)) || []
    }

    return this
  }

  /**
   * Fetch raw article data from the database
   *
   * @param {number} id
   * @returns {object[] | null}
   */

  static async fetchArticle(id) {
    const query = new SimpleQuery()

    query.select('*').from('rtd.Article').where(['_id =', id]).limit(1)

    const [rows] = await database.execute(query.query)

    return rows.length ? rows[0] : null
  }

  static async fetchContent(id) {
    const query = new SimpleQuery()

    query
      .select(['_id', 'text', 'image', 'imageDescription', 'imageAlign'])
      .from('rtd.ArticleParagraph')
      .where(['article =', id])
      .order('position')

    const [rows] = await database.execute(query.query)

    return rows.length ? rows : null
  }

  import({ article, content }) {
    this.#article = article || {}
    this.#content = content || []
  }

  export() {
    return {
      article: this.#article,
      content: this.#content
    }
  }

  from(event) {
    if (event.name !== 'Article') return

    this.import(event.export())
  }
}

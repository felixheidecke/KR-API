import SimpleQuery from '#libs/simple-query-builder'
import database from '#libs/database'
import { toUrlSlug } from '#libs/slugify'
import { fromUnixTime } from 'date-fns'
import textile from 'textile-js'
import { ASSET_BASE_URL } from '#constants'

export default class Article {
  #article = {}
  #content = []

  // --- [ Methods ] -----------------------------------------------------------

  _constructor(article) {
    if (!article) return

    this.import(article)
  }

  get data() {
    if (!this.#article._id) return null

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
    return this.#article.website?.trim() || undefined
  }

  get author() {
    return this.#article.author?.trim() || undefined
  }

  get hasData() {
    return Object.keys(this.#article).length || this.#content.length
  }

  async load(id, config = {}) {
    this.#article = (await fetchArticle(id)) || {}

    if (config.parts?.includes('content')) {
      this.#content = (await fetchContent(id)) || []
    }

    return this
  }

  async save() {
    return this
  }

  // --- [ Export / Import ] ---------------------------------------------------

  import({ article, content }) {
    if (article) {
      this.#article = Object.assign({}, article)
    }

    if (content) {
      this.#content = [...content]
    }

    return this
  }

  export() {
    return Object.assign(
      {},
      {
        article: this.#article,
        content: this.#content
      }
    )
  }
}

async function fetchArticle(id) {
  const query = new SimpleQuery()

  query.select('*').from('rtd.Article').where('_id = ?').limit(1)

  const [rows] = await database.execute(query.query, [id])

  if (!rows.length) return

  return rows[0]
}

async function fetchContent(id) {
  const query = new SimpleQuery()

  query
    .select(['_id', 'text', 'image', 'imageDescription', 'imageAlign'])
    .from('rtd.ArticleParagraph')
    .where('article = ?')
    .order('position')

  const [rows] = await database.execute(query.query, [id])

  if (!rows.length) return

  return rows
}

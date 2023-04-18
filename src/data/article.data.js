import SimpleQuery from '#libs/simple-query-builder'
import database from '#libs/database'
import { toUrlSlug } from '#libs/slugify'
import { fromUnixTime } from 'date-fns'
import textile from 'textile-js'
import { ASSET_BASE_URL } from '#constants'

export async function getArticle(id = 0, config = null) {
  config = {
    full: true,
    ...config
  }

  // --- Data ---

  let article = {}
  let content = []

  // --- Initialise ---

  if (id) {
    await fetchArticle()
  }

  if (id && config.full) {
    await fetchContent()
  }

  function getId() {
    return article._id
  }

  function getModule() {
    return article.module
  }

  function getActive() {
    return !!article.active
  }

  function getSlug() {
    return article.title ? toUrlSlug(getTitle()) : undefined
  }

  function getTitle() {
    return article.title ? article.title.trim() : undefined
  }

  function getDate() {
    return article.date ? fromUnixTime(article.date).toString() : undefined
  }

  function getText() {
    return article.text ? textile.parse(article.text) : undefined
  }

  function getContent() {
    return content.length
      ? content.map(({ text, image, imageDescription, imageAlign }) => ({
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

  function getImage() {
    const { image, imageSmall, imageDescription } = article

    return image
      ? {
          src: ASSET_BASE_URL + image,
          thumbSrc: imageSmall ? ASSET_BASE_URL + imageSmall : undefined,
          alt: imageDescription || ''
        }
      : undefined
  }

  function getPdf() {
    const { pdf, pdfName, pdfTitle } = article

    return pdf
      ? {
          src: ASSET_BASE_URL + pdf,
          name: pdfName || '',
          title: pdfTitle ? pdfTitle.trim() : 'Weitere Infos'
        }
      : undefined
  }

  function getWebsite() {
    return article.website || undefined
  }

  function getAuthor() {
    return article.author || undefined
  }

  function get() {
    if (!getId()) return null

    return {
      id: getId(),
      module: getModule(),
      slug: getSlug(),
      title: getTitle(),
      date: getDate(),
      text: getText(),
      image: getImage(),
      content: getContent(),
      pdf: getPdf(),
      website: getWebsite(),
      author: getAuthor()
    }
  }

  async function fetchArticle() {
    const query = new SimpleQuery()

    query.select('*').from('rtd.Article').where('_id = ?').limit(1)

    const [rows] = await database.execute(query.query, [id])

    if (!rows.length) return

    article = rows[0]
  }

  async function fetchContent() {
    const query = new SimpleQuery()

    query
      .select(['_id', 'text', 'image', 'imageDescription', 'imageAlign'])
      .from('rtd.ArticleParagraph')
      .where('article = ?')
      .order('position')

    const [rows] = await database.execute(query.query, [id])

    if (!rows.length) return

    content = rows
  }

  function importData(data) {
    article = data.article || article
    content = data.content || content
  }

  function updateData(data) {
    if (data.article) {
      Object.assign(article, data.article)
    }

    if (data.content) {
      content = content.concat(data.content)
    }
  }

  function exportData() {
    return { article, content }
  }

  return {
    get,
    getId,
    getModule,
    getActive,
    getSlug,
    getTitle,
    getDate,
    getText,
    getImage,
    getContent,
    getPdf,
    getWebsite,
    getAuthor,
    import: importData,
    export: exportData,
    update: updateData
  }
}

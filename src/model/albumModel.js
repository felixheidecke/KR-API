import { join } from '#utils/join'
import { toUrlSlug } from '#libs/slugify'
import database from '#libs/database'
import SimpleQuery from '#libs/simple-query-builder'

export default class Album {
  #id

  // Data
  #album = []

  constructor(id) {
    if (!id) {
      throw new Error('Missing required parameter "id"')
    }

    this.#id = id
  }

  get id() {
    return +this.#album[0]._id
  }

  get title() {
    return this.#album[0].title?.trim()
  }

  get slug() {
    return this.title ? toUrlSlug(this.title) : undefined
  }

  get photos() {
    const baseUrl = 'https://cdn.klickrhein.de/xioni/gallery.php'

    return this.#album.map(({ image, filename, priority, description }) => {
      filename = filename.toLowerCase()

      return {
        src: join(baseUrl, '?', image, '/', filename),
        thumbSrc: join(baseUrl, '?', image, '_thumb/', filename),
        alt: description || '',
        order: +priority
      }
    })
  }

  get data() {
    return {
      id: this.id,
      title: this.title,
      slug: this.slug,
      photos: this.photos
    }
  }

  async load() {
    this.#album = (await Album.fetchAlbum(this.#id)) || []
  }

  static async fetchAlbum(id) {
    const query = new SimpleQuery()
      .select([
        'album._id as _id',
        'album.title as title',
        'album.priority as priority',
        'photo.image as image',
        'photo.filename as filename',
        'photo.description as description'
      ])
      .from('rtd.PhotoAlbum AS album')
      .leftJoin('rtd.Photo AS photo', 'album._id = photo.album')
      .where(['album._id =', id])
      .order('photo.priority')

    const [rows] = await database.execute(query.query)

    return rows.length ? rows : null
  }
}

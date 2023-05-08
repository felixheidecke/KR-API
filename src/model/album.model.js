import SimpleQuery from '#libs/simple-query-builder'
import database from '#libs/database'
import { toUrlSlug } from '#libs/slugify'
import { join } from '#helper/join'

export default class Album {
  #album = []

  _constructor(album) {
    if (!album) return

    this.import(album)
  }

  // --- [ Getter ] ------------------------------------------------------------

  /**
   * Combined getter
   *
   * @returns {object}
   */

  get data() {
    return {
      id: this.id,
      title: this.title,
      slug: this.slug,
      photos: this.photos
    }
  }

  /**
   * Get Album ID
   *
   * @returns {number}
   */

  get id() {
    return +this.#album[0]._id
  }

  /**
   * Get Album Title
   *
   * @returns {string|undefined}
   */

  get title() {
    return this.#album[0].title?.trim()
  }

  /**
   * Get Slug (slugified title)
   *
   * @returns {string|undefined}
   */

  get slug() {
    return this.title ? toUrlSlug(this.title) : undefined
  }

  /**
   * Return a list of photos
   *
   * @returns {Array<Photo>} List of Photos
   * @returns {string} Photo.src
   * @returns {string} Photo.thumbSrc
   * @returns {string} Photo.alt
   * @returns {number} Photo.order
   */

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

  // --- [ Methods ] -----------------------------------------------------------

  async fetch(id) {
    this.#album = await fetchAlbum(id)

    return this
  }

  import(album) {
    this.#album = [...album]

    return this
  }

  export() {
    return [...this.#album]
  }
}

// Static functions

export async function fetchAlbum(id) {
  const query = new SimpleQuery()

  query
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

  if (!rows.length) return

  return rows
}

import SimpleQuery from '#libs/simple-query-builder'
import database from '#libs/database'
import { toUrlSlug } from '#libs/slugify'
import { join } from '#helper/join'

export async function getAlbum(id = 0, config = {}) {
  // --- Data ---
  let album = []

  // --- Initialise ---
  if (id) {
    await fetchAlbum()
  }

  /**
   * Get Album ID
   *
   * @returns {number}
   */

  function getId() {
    return +album[0]._id
  }

  /**
   * Get Album Title
   *
   * @returns {string|undefined}
   */

  function getTitle() {
    return album[0].title ? album[0].title.trim() : undefined
  }

  /**
   * Get Slug (slugified title)
   *
   * @returns {string|undefined}
   */

  function getSlug() {
    return album[0].title ? toUrlSlug(getTitle()) : undefined
  }

  /**
   * Combined get values
   *
   * @returns {object}
   */

  function get() {
    return {
      id: getId(),
      title: getTitle(),
      slug: getSlug(),
      photos: getPhotos()
    }
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

  function getPhotos() {
    const baseUrl = 'https://cdn.klickrhein.de/xioni/gallery.php'

    return album.map(({ image, filename, priority, description }) => {
      filename = filename.toLowerCase()

      return {
        src: join(baseUrl, '?', image, '/', filename),
        thumbSrc: join(baseUrl, '?', image, '_thumb/', filename),
        alt: description || '',
        order: +priority
      }
    })
  }

  async function fetchAlbum() {
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

    album = rows
  }

  /**
   * Export raw Database data
   *
   * @returns {[]}
   */

  function exportData() {
    return Object.freeze({ album })
  }

  // Return API

  return {
    get,
    getId,
    getTitle,
    getSlug,
    getPhotos,
    exportData
  }
}

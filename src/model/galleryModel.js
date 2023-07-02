import database from '#libs/database'
import { toUrlSlug } from '#libs/slugify'

export default class GalleryModel {
  #module

  // Data
  #gallery = []

  constructor(module) {
    if (!module) {
      throw new Error('Missing required parameter "module"')
    }

    this.#module = module
  }

  get length() {
    this.#gallery.length
  }

  get data() {
    if (!this.length) return

    return this.#gallery.map((album) => ({
      id: album._id,
      title: album.title.trim(),
      slug: toUrlSlug(album.title),
      count: +album.photoCount
    }))
  }

  async load() {
    this.#gallery = (await GalleryModel.fetchAlbum(this.#module)) || []

    return this
  }

  static async fetchAlbum(module) {
    const query = `
      SELECT    album._id AS _id, album.title AS title,
                album.priority AS priority, COUNT(photo._id) AS photoCount
      FROM      rtd.PhotoAlbum AS album
      LEFT JOIN rtd.Photo AS photo ON album._id = photo.album
      WHERE     album.module = ${module}
      GROUP BY  photo.album
      ORDER BY  album.priority ASC`

    const [rows] = await database.execute(query)

    return rows.length ? rows.filter(({ photoCount }) => photoCount > 0) : null
  }
}

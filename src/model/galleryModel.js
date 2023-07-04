import database from '#libs/database'
import { toUrlSlug } from '#libs/slugify'

export default class GalleryModel {
  #module
  #exists

  // Data
  #gallery = []

  constructor(module) {
    if (!module) throw new Error('Missing required parameter "module"')

    this.#module = module
    this.#exists = false
  }

  get length() {
    return this.#gallery.length
  }

  get exists() {
    return this.#exists
  }

  get data() {
    if (!this.exists) return

    if (!this.length) return []

    return this.#gallery.map((album) => ({
      id: album._id,
      title: album.title.trim(),
      slug: toUrlSlug(album.title),
      count: +album.photoCount
    }))
  }

  async checkExists() {
    this.#exists = await GalleryModel.moduleExists(this.#module)
  }

  async load() {
    await this.checkExists()

    if (!this.exists) return

    try {
      this.#gallery = (await GalleryModel.fetchAlbum(this.#module)) || []
    } catch (error) {
      console.log(error)
      throw new Error(error.code)
    }
  }

  static async moduleExists(module) {
    const query = `
      SELECT  COUNT(_id) as found
      FROM    \`Module\`
      WHERE   \`type\` = "gallery"
      AND     _id = ${module}`

    const [rows] = await database.execute(query)

    return !!rows[0].found
  }

  static async fetchAlbum(module) {
    const query = `
      SELECT     album._id AS _id, album.title AS title,
                 album.priority AS priority, COUNT(photo._id) AS photoCount
      FROM       rtd.PhotoAlbum AS album
      LEFT JOIN  rtd.Photo AS photo ON album._id = photo.album
      WHERE      album.module = ${module}
      GROUP BY   photo.album
      ORDER BY   album.priority ASC`

    const [rows] = await database.execute(query)

    return rows.length ? rows.filter(({ photoCount }) => photoCount > 0) : null
  }
}

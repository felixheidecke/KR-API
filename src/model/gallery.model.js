import SimpleQuery from '#libs/simple-query-builder'
import database from '#libs/database'
import { toUrlSlug } from '#libs/slugify'

export default class Gallery {
  #gallery = []

  _constructor(gallery) {
    if (!gallery) return

    this.import(gallery)
  }

  // --- [ Getter ] ------------------------------------------------------------

  get data() {
    return this.#gallery.map((album) => ({
      id: album._id,
      title: album.title.trim(),
      slug: toUrlSlug(album.title),
      count: +album.photoCount
    }))
  }

  async fetch(module) {
    this.#gallery = (await fetchGallery(module)) || []

    return this
  }

  // --- [ Methods ] -----------------------------------------------------------

  import(gallery) {
    this.#gallery = [...gallery]

    return this
  }

  export() {
    return [...gallery]
  }
}

async function fetchGallery(module) {
  const query = new SimpleQuery()

  query
    .select([
      'album._id as _id',
      'album.title as title',
      'album.priority as priority',
      'COUNT(photo._id) as photoCount'
    ])
    .from('rtd.PhotoAlbum AS album')
    .leftJoin('rtd.Photo AS photo', 'album._id = photo.album')
    .where(['album.module =', module])
    .group('photo.album')
    .order('album.priority')

  const [rows] = await database.execute(query.query)

  if (!rows.length) return

  return rows.filter(({ photoCount }) => photoCount > 0)
}

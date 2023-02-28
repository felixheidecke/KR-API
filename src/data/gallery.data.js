import SimpleQuery from '#libs/simple-query-builder'
import database from '#libs/database'
import { toUrlSlug } from '#libs/slugify'

export async function getGallery(module = 0, config = {}) {
  // --- Data ---
  let gallery = []

  // --- Initialise ---
  if (module) {
    await fetchGallery()
  }

  function get() {
    const data = !config.empty
      ? gallery.filter(({ photoCount }) => photoCount > 0)
      : gallery

    return data.map((album) => ({
      id: album._id,
      title: album.title.trim(),
      slug: toUrlSlug(album.title),
      count: album.photoCount
    }))
  }

  async function fetchGallery() {
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

    gallery = rows
  }

  function exportData() {
    return Object.freeze({ gallery })
  }

  return {
    get,
    exportData
  }
}

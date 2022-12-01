import database from '#libs/database'
import { albumAdapter } from '#utils/gallery'
import { groupBy } from 'lodash-es'

export const getGallery = async (is) => {
  if (!is) return new Error('Missing required param "is"')

  let gallery
  const query = `
    SELECT    album._id as id,
              album.module as module,
              album.title as title,
              album.priority as album_sort,
              photo.image as path,
              photo.filename as name,
              photo.priority as sort,
              photo.description as alt
    FROM      rtd.PhotoAlbum AS album
    LEFT JOIN rtd.Photo AS photo ON album._id = photo.album
    WHERE     album.module = ?
    ORDER BY  album.priority ASC`

  const [pictures] = await database.execute(query, [is])

  if (!pictures.length) return

  gallery = groupBy(pictures, 'id')
  gallery = Object.values(gallery)
  gallery = gallery.map(albumAdapter)

  return gallery
}

export const getAlbum = async (id) => {
  if (!id) return new Error('Missing required param "id"')

  const query = `
    SELECT    album._id as id,
              album.module as module,
              album.title as title,
              album.priority as album_sort,
              photo.image as path,
              photo.filename as name,
              photo.priority as sort,
              photo.description as alt
    FROM      rtd.PhotoAlbum AS album
    LEFT JOIN rtd.Photo AS photo ON album._id = photo.album
    WHERE     album._id = ?
    ORDER BY  photo.priority ASC
    LIMIT     1`

  const [pictures] = await database.execute(query, [id])

  if (!pictures.length) return

  return albumAdapter(pictures)
}

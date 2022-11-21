import database from '#libs/database'
import { groupBy } from 'lodash-es'
import slugify from 'slugify'

export const getGallery = async (module) => {
  if (!module) return new Error('Missing required param "module"')

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

  const [pictures] = await database.execute(query, [module])

  if (!pictures.length) return

  gallery = groupBy(pictures, 'id')
  gallery = Object.values(gallery)
  gallery = gallery.map((gallery) => remapAlbum(gallery))

  return gallery
}

export const getAlbum = async (id) => {
  if (!id) return new Error('Missing required param "module"')

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
  ORDER BY  photo.priority ASC`

  const [pictures] = await database.execute(query, [id])

  if (!pictures.length) return

  return pictures.map((gallery) => remapAlbum(gallery))
}

// Helper

const remapAlbum = (gallery) => {
  const baseUrl = 'https://cdn.klickrhein.de/xioni/gallery.php'

  return {
    id: +gallery[0].id,
    module: +gallery[0].module,
    title: gallery[0].title.trim(),
    order: +gallery[0].album_sort,
    photos: gallery.map(({ path, name, sort, alt }) => ({
      src: `${baseUrl}?${path}/${slugify(name)}`,
      thumbSrc: `${baseUrl}?${path}_thumb/${slugify(name)}`,
      alt: alt || '',
      order: +sort
    }))
  }
}

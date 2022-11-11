import database from '#libs/database'
import { fotoAdapter } from './_utils.js'

/**
 * Fetch gallery info
 *
 * @param {number} id
 * @returns {Promise<object>} gallery data
 */

export const getGallery = async (id) => {
  if (!id) return new Error('Missing required param "id" in getGallery()')

  const query = `
    SELECT _id as id, title
    FROM   rtd.PhotoAlbum
    WHERE  _id = ?
    LIMIT  1`

  try {
    const [rows] = await database.execute(query, [id])

    if (!rows.length) return null

    return rows[0]
  } catch (error) {
    console.error(error)
    return
  }
}

/**
 * Fetch a list of email adresses
 *
 * @param {number[]|string[]} ids list of id matching rtd.Formmail
 * @returns {Promise<string[]>} list of email addresses
 */

export const getGalleryPhotos = async (album) => {
  if (!album)
    return new Error('Missing required param "album" in getGalleryPhotos()')

  const query = `
    SELECT _id as id, description, filename, priority
    FROM   rtd.Photo
    WHERE  album = ?
    ORDER BY priority ASC`

  try {
    const [photos] = await database.execute(query, [album])

    if (!photos.length) return null

    return photos.map((photo) => fotoAdapter(photo))
  } catch (error) {
    console.error(error)
    return
  }
}

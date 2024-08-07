import { MEDIA_BASE_PATH } from '#utils/constants.js'
import knex from '#libs/knex.js'

export namespace GalleryRepo {
  export type Album = {
    _id: number
    module: number
    title: string
    image: string
    thumb: string
    description: string
  }
}

export class GalleryRepo {
  /**
   * Retrieves all albums for a specific module.
   *
   * @param {number} module - The module identifier.
   * @returns {Promise<Album[] | null>} A promise that resolves to an array of Album objects or null if the module doesn't exist.
   */

  public static async readGallery(module: number): Promise<GalleryRepo.Album[]> {
    const query = await knex('PhotoAlbum')
      .select([
        'Album._id AS _id',
        'Album.module AS module',
        'Album.title AS title',
        knex.raw(
          `CONCAT('${MEDIA_BASE_PATH}/', Photo.image, '/#', LOWER(Photo.filename)) AS image`
        ),
        knex.raw(`CONCAT('${MEDIA_BASE_PATH}/', Photo.image, '_thumb/') AS thumb`),
        knex.raw('COALESCE(NULLIF(Photo.description, ""), NULL) AS description')
      ])
      .from('PhotoAlbum as Album')
      .leftJoin('Photo', 'Album._id', 'Photo.album')
      .where(knex.raw('Album.module = ' + +module))
      .orderBy('Album.priority')

    return query
  }

  /**
   * Retrieves a specific album by its module and id.
   *
   * @param {number} module - The module identifier.
   * @param {number} id - The album identifier.
   * @returns {Promise<Album | null>} A promise that resolves to an Album object or null if not found.
   */

  public static async readAlbum(module: number, id: number): Promise<GalleryRepo.Album[]> {
    const query = await knex('PhotoAlbum')
      .select([
        'Album._id AS _id',
        'Album.module AS module',
        'Album.title as title',
        knex.raw(
          `CONCAT('${MEDIA_BASE_PATH}/', Photo.image, '/#', LOWER(Photo.filename)) AS image`
        ),
        knex.raw(`CONCAT('${MEDIA_BASE_PATH}/', Photo.image, '_thumb/') AS thumb`),
        knex.raw(`IF(ISNULL(Photo.description), '', Photo.description) AS description`)
      ])
      .from('PhotoAlbum AS Album')
      .leftJoin('Photo', 'Album._id', 'Photo.album')
      .where(knex.raw('Album.module = ' + +module + ' AND Album._id = ' + +id))
      .orderBy('Photo.priority')

    return query
  }
}

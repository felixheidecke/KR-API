import knex from '../../../modules/knex.js'

export type RepoAlbum = {
  _id: number
  module: number
  title: string
  image: string
  thumb: string
  description: string
}

const PATH = 'https://cdn.klickrhein.de/xioni/gallery.php\\?'

export class GalleryRepo {
  /**
   * Retrieves all albums for a specific module.
   *
   * @param {number} module - The module identifier.
   * @returns {Promise<Album[] | null>} A promise that resolves to an array of Album objects or null if the module doesn't exist.
   */

  public static async readGallery(module: number): Promise<RepoAlbum[]> {
    const query = knex('PhotoAlbum')
      .select([
        'Album._id AS _id',
        'Album.module AS module',
        'Album.title AS title',
        knex.raw(`CONCAT('${PATH}', Photo.image, '/image') AS image`),
        knex.raw(`CONCAT('${PATH}', Photo.image, '/_thumb/image') AS thumb`),
        knex.raw(
          `IF(Photo.description IS NULL OR Photo.description = '', LOWER(Photo.filename), Photo.description) AS description`
        )
      ])
      .from('PhotoAlbum as Album')
      .leftJoin('Photo', 'Album._id', 'Photo.album')
      .where(knex.raw('Album.module = ' + +module))
      .orderBy('Album.priority')

    return await query
  }

  /**
   * Retrieves a specific album by its module and id.
   *
   * @param {number} module - The module identifier.
   * @param {number} id - The album identifier.
   * @returns {Promise<Album | null>} A promise that resolves to an Album object or null if not found.
   */

  public static async readAlbum(module: number, id: number): Promise<RepoAlbum[]> {
    return await knex('PhotoAlbum')
      .select([
        'Album._id AS _id',
        'Album.module AS module',
        'Album.title as title',
        knex.raw(`CONCAT('${PATH}', Photo.image, '/image') AS image`),
        knex.raw(`CONCAT('${PATH}', Photo.image, '/_thumb/image') AS thumb`),
        knex.raw(
          `IF(Photo.description IS NULL OR Photo.description = '', LOWER(Photo.filename), Photo.description) AS description`
        )
      ])
      .from('PhotoAlbum AS Album')
      .leftJoin('Photo', 'Album._id', 'Photo.album')
      .where(knex.raw('Album.module = ' + +module + ' AND Album._id = ' + +id))
      .orderBy('Photo.priority')
  }
}

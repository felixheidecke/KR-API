import { DetailLevel } from '../../shop/utils/detail-level.js'
import knex from '../../../modules/knex.js'

import type { Knex } from 'knex'

export type RepoAlbum = {
  id: number
  module: number
  title: string
  image: string
  path: string
  filename: string
  description?: string | null
}

const PATH = 'https://cdn.klickrhein.de/xioni/gallery.php?'

export class GalleryRepo {
  /**
   * Retrieves all albums for a specific module.
   *
   * @param {number} module - The module identifier.
   * @returns {Promise<Album[] | null>} A promise that resolves to an array of Album objects or null if the module doesn't exist.
   */

  public static async readGallery(
    module: number,
    query?: {
      detailLevel?: DetailLevel
    }
  ): Promise<RepoAlbum[] | null> {
    const detailLevel = query?.detailLevel || DetailLevel.DEFAULT
    let galleryQuery: Knex.QueryBuilder

    if (detailLevel === DetailLevel.DEFAULT) {
      galleryQuery = knex('PhotoAlbum')
        .select([
          'Album._id AS id',
          'Album.module AS module',
          'Album.title AS title',
          'Photo.image as image',
          'Photo.filename as filename',
          'Photo.description as description'
        ])
        .from('PhotoAlbum as Album')
        .leftJoin('Photo', 'Album._id', 'Photo.album')
        .where('Album.module', module)
        .orderBy('Album.priority')
    } else {
      galleryQuery = knex('PhotoAlbum')
        .select({
          id: 'Album._id',
          title: 'Album.title',
          module: 'Album.module'
        })
        .from('PhotoAlbum as Album')
        .where('Album.module', module)
        .orderBy('Album.priority')
    }

    const repoGallery = (await galleryQuery) as RepoAlbum[]

    if (!repoGallery) {
      return null
    } else if (detailLevel === DetailLevel.MINIMAL) {
      return repoGallery
    } else {
      return repoGallery.map(photo => ({ ...photo, path: PATH }))
    }
  }

  /**
   * Retrieves a specific album by its module and id.
   *
   * @param {number} module - The module identifier.
   * @param {number} id - The album identifier.
   * @returns {Promise<Album | null>} A promise that resolves to an Album object or null if not found.
   */

  public static async readAlbum(module: number, id: number): Promise<RepoAlbum[] | null> {
    const albumQuery =
      knex('PhotoAlbum')
        .select([
          'Album._id AS id',
          'Album.module AS module',
          'Album.title as title',
          'Photo.image as image',
          'Photo.filename as filename',
          'Photo.description as description'
        ])
        .from('PhotoAlbum AS Album')
        .leftJoin('Photo', 'Album._id', 'Photo.album')
        .where({ 'Album._id': id, 'Album.module': module })
        .orderBy('Photo.priority') || null

    const repoAlbum = await albumQuery

    return repoAlbum ? repoAlbum.map(photo => ({ ...photo, path: PATH })) : null
  }
}

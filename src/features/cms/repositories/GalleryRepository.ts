import { Album } from '../model/Album.js'
import { DetailLevel } from '../../shop/utils/detail-level.js'
import { first, uniqBy } from 'lodash-es'
import { Image } from '../../../common/entities/Image.js'
import { ModuleRepository } from '../../shop/gateways/ModuleRepository.js'
import knex from '../../../services/knex.js'

import type { Knex } from 'knex'

type RepositoryAlbum = {
  id: number
  title: string
  image?: string
  filename?: string
  description?: string | null
}

export class GalleryRepository {
  /**
   * Retrieves all albums for a specific module.
   *
   * @param {number} module - The module identifier.
   * @returns {Promise<Album[] | null>} A promise that resolves to an array of Album objects or null if the module doesn't exist.
   */

  public static async getGallery(
    module: number,
    detailLevel: DetailLevel = 0,
    skipModuleCheck = false
  ) {
    if (!skipModuleCheck && !(await ModuleRepository.moduleExists(module))) return null

    let galleryQuery: Knex.QueryBuilder

    if (detailLevel >= DetailLevel.BASIC) {
      galleryQuery = knex('PhotoAlbum')
        .select([
          'Album._id AS id',
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
        .select(['Album._id AS id', 'Album.title AS title'])
        .from('PhotoAlbum as Album')
        .where('Album.module', module)
        .orderBy('Album.priority')
    }

    const repositoryGallery = await galleryQuery

    return repositoryGallery
      ? this.convertToGallery(module, repositoryGallery as RepositoryAlbum[])
      : null
  }

  /**
   * Retrieves a specific album by its module and id.
   *
   * @param {number} module - The module identifier.
   * @param {number} id - The album identifier.
   * @returns {Promise<Album | null>} A promise that resolves to an Album object or null if not found.
   */

  public static async getAlbum(module: number, id: number) {
    const album = await knex('PhotoAlbum')
      .select([
        'Album._id AS id',
        'Album.title as title',
        'Photo.image as image',
        'Photo.filename as filename',
        'Photo.description as description'
      ])
      .from('PhotoAlbum AS Album')
      .leftJoin('Photo', 'Album._id', 'Photo.album')
      .where({ 'Album._id': id, 'Album.module': module })
      .orderBy('Photo.priority')

    return album ? this.convertToAlbum(module, album as RepositoryAlbum[]) : null
  }

  /**
   * Converts a collection of repository albums to a gallery format.
   *
   * @param {number} module - The module identifier.
   * @param {RepositoryAlbum[]} repoGallery - Array of albums from the repository.
   * @returns {Album[]} An array of Album objects.
   */

  private static convertToGallery(module: number, repoGallery: RepositoryAlbum[]) {
    return uniqBy(repoGallery, 'id').map(repoAlbum => {
      const album = new Album(module)
      album.id = repoAlbum.id
      album.title = repoAlbum.title

      if (repoAlbum.image) {
        album.images = repoGallery
          .filter(photo => photo.id === repoAlbum.id)
          .map(photo => {
            const image = new Image(
              photo.image + '/' + photo.filename?.toLowerCase(),
              photo.description || ''
            )
            image.path = 'https://cdn.klickrhein.de/xioni/gallery.php?'

            image.addSrc(photo.image + '_thumb/' + photo.filename?.toLowerCase(), 'small')

            return image
          })
      }

      return album
    })
  }

  /**
   * Converts a repository album array to an Album object.
   *
   * @param {number} module - The module number.
   * @param {RepositoryAlbum[]} repoAlbum - Array of repository album objects.
   * @returns {Album} The converted Album object.
   */

  private static convertToAlbum(module: number, repoAlbum: RepositoryAlbum[]) {
    const album = new Album(module)
    album.id = first(repoAlbum)?.id as number
    album.title = first(repoAlbum)?.title as string
    album.images = repoAlbum.map(photo => {
      const image = new Image(
        photo.image + '/' + photo.filename?.toLowerCase(),
        photo.description || ''
      )
      image.path = 'https://cdn.klickrhein.de/xioni/gallery.php?'

      image.addSrc(photo.image + '_thumb/' + photo.filename?.toLowerCase(), 'small')

      return image
    })

    return album
  }
}

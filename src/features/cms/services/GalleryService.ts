import { Album } from '../entities/Album.js'
import { first, uniqBy } from 'lodash-es'
import { GalleryRepo, type RepoAlbum } from '../gateways/GalleryRepo.js'
import { Image } from '../../../common/entities/Image.js'
import { ModuleRepo } from '../../../common/gateways/ModuleRepo.js'
import { DetailLevel } from '../../shop/utils/detail-level.js'
import { HttpError } from '../../../common/decorators/Error.js'
import path from 'path'

export class GalleryService {
  public static async getGallery(
    module: number,
    config: {
      detailLevel?: DetailLevel
      shouldThrow?: boolean
      skipModuleCheck?: boolean
    } = {}
  ) {
    const detailLevel = config.detailLevel || DetailLevel.DEFAULT
    const skipModuleCheck = config.skipModuleCheck || false
    const shouldThrow = config.shouldThrow || false

    if (!skipModuleCheck && !(await ModuleRepo.moduleExists(module))) {
      if (shouldThrow) {
        throw HttpError.NOT_FOUND('Module not found.')
      }

      return null
    }

    const gallery = await GalleryRepo.readGallery(module, { detailLevel })

    return gallery ? GalleryServiceUtils.createGalleryFromRepo(gallery) : []
  }

  public static async getAlbum(
    module: number,
    id: number,
    config: {
      shouldThrow?: boolean
    } = {}
  ) {
    const repoAlbum = await GalleryRepo.readAlbum(module, id)

    if (!repoAlbum && config.shouldThrow) {
      throw HttpError.NOT_FOUND('Album not found.')
    }

    return repoAlbum ? GalleryServiceUtils.createAlbumFromRepo(repoAlbum) : null
  }
}

export class GalleryServiceUtils {
  /**
   * Converts a collection of repo albums to a gallery format.
   *
   * @param {number} module - The module identifier.
   * @param {RepoAlbum[]} repoGallery - Array of albums from the repo.
   * @returns {Album[]} An array of Album objects.
   */

  static createGalleryFromRepo(repoGallery: RepoAlbum[]) {
    return uniqBy(repoGallery, 'id').map(repoAlbum => {
      const album = new Album(repoAlbum.module)
      album.id = repoAlbum.id
      album.title = repoAlbum.title

      if (repoAlbum.image) {
        album.images = repoGallery
          .filter(photo => photo.id === repoAlbum.id)
          .map(photo => {
            const image = new Image(
              [photo.path, photo.image, photo.filename.toLowerCase()].join('/'),
              photo.description || ''
            )

            image.addSrc(
              [photo.path, photo.image, '_tumb', photo.filename.toLowerCase()].join('/'),
              'small'
            )

            return image
          })
      }

      return album
    })
  }

  /**
   * Converts a repo album array to an Album object.
   *
   * @param {number} module - The module number.
   * @param {RepoAlbum[]} repoAlbum - Array of repo album objects.
   * @returns {Album} The converted Album object.
   */

  static createAlbumFromRepo(repoAlbum: RepoAlbum[]) {
    const album = new Album(first(repoAlbum)?.module as number)
    album.id = first(repoAlbum)?.id as number
    album.title = first(repoAlbum)?.title as string
    album.images = repoAlbum.map(photo => {
      const image = new Image(
        [photo.path, photo.image, photo.filename.toLowerCase()].join('/'),
        photo.description || ''
      )

      image.addSrc(
        [photo.path, photo.image, '_tumb', photo.filename.toLowerCase()].join('/'),
        'small'
      )

      return image
    })

    return album
  }
}

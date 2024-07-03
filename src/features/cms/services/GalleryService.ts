import { Album } from '../entities/Album.js'
import { first, uniqBy } from 'lodash-es'
import { GalleryRepo, type RepoAlbum } from '../gateways/GalleryRepo.js'
import { Image } from '../../../common/entities/Image.js'
import { ModuleRepo } from '../../../common/gateways/ModuleRepo.js'
import { HttpError } from '../../../common/decorators/Error.js'

export class GalleryService {
  public static async getGallery(
    module: number,
    config: {
      shouldThrow?: boolean
    } = {}
  ) {
    if (config.shouldThrow && !(await ModuleRepo.moduleExists(module))) {
      throw HttpError.NOT_FOUND('Module not found.')
    }

    const gallery = await GalleryRepo.readGallery(module)

    return GalleryService.createGalleryFromRepo(gallery)
  }

  public static async getAlbum(
    module: number,
    id: number,
    config: {
      shouldThrow?: boolean
    } = {}
  ) {
    if (config.shouldThrow && !(await ModuleRepo.moduleExists(module))) {
      throw HttpError.NOT_FOUND('Module not found.')
    }

    const repoAlbum = await GalleryRepo.readAlbum(module, id)

    if (config.shouldThrow && !repoAlbum.length) {
      throw HttpError.NOT_FOUND('Album not found.')
    }

    return GalleryService.createAlbumFromRepo(repoAlbum)
  }

  /**
   * Converts a collection of repo albums to a gallery format.
   *
   * @param {number} module - The module identifier.
   * @param {RepoAlbum[]} repoGallery - Array of albums from the repo.
   * @returns {Album[]} An array of Album objects.
   */

  private static createGalleryFromRepo(repoGallery: RepoAlbum[]) {
    return uniqBy(repoGallery, 'id').map(repoAlbum => {
      const album = new Album(repoAlbum.module)
      album.id = repoAlbum._id
      album.title = repoAlbum.title

      if (repoAlbum.image) {
        album.images = repoGallery
          .filter(photo => photo._id === repoAlbum._id)
          .map(photo => {
            const image = new Image(photo.image, photo.description)

            image.addSrc(photo.thumb, 'small')

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

  private static createAlbumFromRepo(repoAlbum: RepoAlbum[]) {
    const album = new Album(first(repoAlbum)?.module as number)
    album.id = first(repoAlbum)?._id as number
    album.title = first(repoAlbum)?.title as string
    album.images = repoAlbum.map(photo => {
      const image = new Image(photo.image, photo.description)

      image.addSrc(photo.thumb, 'small')

      return image
    })

    return album
  }
}

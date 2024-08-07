import { Album } from '../entities/album.js'
import { first, uniqBy } from 'lodash-es'
import { GalleryRepo } from '../providers/gallery-repo.js'
import { HttpError } from '#utils/http-error.js'
import { ModuleRepo } from '#common/providers/module-repo.js'
import { Image } from '#common/entities/image.js'

type Config = {
  skipModuleCheck?: boolean
}

export namespace GalleryService {
  export type GetGallery = (module: number, config?: Config) => Promise<Album[]>
  export type GetAlbum = (module: number, id: number, config?: Config) => Promise<Album>
}

export class GalleryService {
  public static getGallery: GalleryService.GetGallery = async (module, config = {}) => {
    const [moduleExists, repoGallery] = await Promise.all([
      config.skipModuleCheck ? ModuleRepo.moduleExists(module) : Promise.resolve(true),
      GalleryRepo.readGallery(module)
    ])

    if (!moduleExists) {
      throw HttpError.NOT_FOUND('Module not found.')
    }

    return repoGallery.length ? GalleryService.createGalleryFromRepo(repoGallery) : []
  }

  public static getAlbum: GalleryService.GetAlbum = async (module, id, config = {}) => {
    const [moduleExists, repoAlbum] = await Promise.all([
      config.skipModuleCheck ? ModuleRepo.moduleExists(module) : Promise.resolve(true),
      GalleryRepo.readAlbum(module, id)
    ])

    if (!moduleExists) {
      throw HttpError.NOT_FOUND('Module not found.')
    }

    if (!repoAlbum.length) {
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

  private static createGalleryFromRepo(repoGallery: GalleryRepo.Album[]) {
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

  private static createAlbumFromRepo(repoAlbum: GalleryRepo.Album[]) {
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

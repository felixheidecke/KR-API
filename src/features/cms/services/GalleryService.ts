import { ErrorCodes, ModuleError } from '../../../common/decorators/Error.js'
import type { DetailLevel } from '../../shop/utils/detail-level.js'
import { GalleryRepository } from '../repositories/GalleryRepository.js'

export class GalleryInteractor {
  public static async getGallery(module: number, detailLevel?: DetailLevel) {
    const gallery = await GalleryRepository.getGallery(module, detailLevel)

    if (!gallery) {
      throw new ModuleError('Gallery not found', ErrorCodes.NOT_FOUND)
    }

    return gallery
  }

  public static async getAlbum(module: number, id: number) {
    const album = await GalleryRepository.getAlbum(module, id)

    if (!album) {
      throw new ModuleError('Album not found', ErrorCodes.NOT_FOUND)
    }

    return album
  }
}

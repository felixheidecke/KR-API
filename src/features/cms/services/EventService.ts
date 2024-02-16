import { fromUnixTime } from 'date-fns'
import { DetailLevel } from '../../shop/utils/detail-level.js'
import { EventRepo, type RepoEvent } from '../gateways/EventRepo.js'
import { Event } from '../entities/Event.js'
import { Image } from '../../../common/entities/Image.js'
import { PDF } from '../../shop/entities/PDF.js'
import { ModuleService } from '../../../common/services/ModuleService.js'
import { HttpError } from '../../../common/decorators/Error.js'

export class EventService {
  public static async getEvent(module: number, id: number, config: { shouldThrow?: boolean } = {}) {
    const repoEvent = await EventRepo.readEvent(module, id)

    if (!repoEvent && config.shouldThrow) {
      throw HttpError.NOT_FOUND('Event not found.')
    }

    return repoEvent ? createEventFromRepo(repoEvent) : null
  }

  public static async getEvents(
    module: number,
    query?: {
      startsBefore?: Date | number
      startsAfter?: Date | number
      endsBefore?: Date | number
      endsAfter?: Date | number
      limit?: number
      detailLevel?: DetailLevel
    },
    config: {
      skipModuleCheck?: boolean
      shouldThrow?: boolean
    } = {}
  ) {
    if (!config.skipModuleCheck && !(await ModuleService.getModule(module))) {
      if (config.shouldThrow) {
        throw HttpError.NOT_FOUND('Module not found.')
      }

      return null
    }

    const events = await EventRepo.readEvents(module, query)

    return events ? events.map(createEventFromRepo) : []
  }
}

// --- [ Utility functions ] -----------------------------------------------------------------------

/**
 * Creates an Event object from repo data.
 *
 * @param {number} module - The module identifier.
 * @param {RepoEvent} event - The raw event data from the repo.
 * @param {ReturnType<typeof EventRepo.getImages>} images - Array of images associated with the event.
 * @param {ReturnType<typeof EventRepo.getFlags>} flags - Array of flags associated with the event.
 * @returns {Event} The constructed Event object.
 */

function createEventFromRepo(repoEvent: RepoEvent): Event {
  const event = new Event(repoEvent.module)
  event.id = repoEvent._id
  event.title = repoEvent.title
  event.startDate = fromUnixTime(repoEvent.startDate)
  event.endDate = fromUnixTime(repoEvent.endDate)
  event.description = repoEvent.description
  event.details = repoEvent.details
  event.website = repoEvent.url || undefined
  event.address = repoEvent.address
  event.coordinates = repoEvent.lat && repoEvent.lng ? [repoEvent.lat, repoEvent.lng] : [0, 0]
  event.flags = repoEvent.flags

  if (repoEvent.image) {
    event.image = new Image(repoEvent.image, repoEvent.imageDescription || repoEvent.title)
    event.image.addSrc(repoEvent.thumb as string, 'small')
  }

  if (repoEvent.pdf) {
    event.pdf = new PDF(repoEvent.pdf)
    event.pdf.title = repoEvent.pdfTitle as string
  }

  if (repoEvent.images?.length) {
    repoEvent.images.forEach(({ image, description }) => {
      event.addImage(new Image(image, description))
    })
  }

  return event
}

export const utils = {
  createEventFromRepo
}

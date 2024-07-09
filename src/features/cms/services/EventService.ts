import { fromUnixTime } from 'date-fns'
import { EventRepo } from '../gateways/EventRepo.js'
import { Event } from '../entities/Event.js'
import { Image } from '../../../common/entities/Image.js'
import { PDF } from '../../shop/entities/PDF.js'
import { HttpError } from '../../../common/decorators/Error.js'
import { omit } from 'lodash-es'
import { Flags } from '../entities/Flags.js'
import { ModuleRepo } from '../../../common/gateways/ModuleRepo.js'

export namespace EventService {
  type Config = {
    shouldThrow?: boolean
  }

  type Query = {
    startsBefore?: Date | number
    startsAfter?: Date | number
    endsBefore?: Date | number
    endsAfter?: Date | number
    limit?: number
    parts?: string[]
  }

  export type GetEventsByModule = (
    module: number,
    query?: Query,
    config?: Config
  ) => Promise<Event[]>

  export type GetEventsWhereIn = (
    whereIn: { modules?: number[]; communes?: string[] },
    query?: Query
  ) => Promise<Event[]>
}

// --- [ Class ] -----------------------------------------------------------------------------------

export class EventService {
  public static async getEventById(
    module: number,
    id: number,
    config: { shouldThrow?: boolean } = {}
  ) {
    const repoEvent = await EventRepo.readEventById(module, id)

    if (!repoEvent && config.shouldThrow) {
      throw HttpError.NOT_FOUND('Event not found.')
    } else if (!repoEvent) {
      return null
    }

    const event = this.createEventFromRepo(repoEvent)

    // prettier-ignore
    await Promise.all([
      EventService.addImages(event),
      EventService.addFlags(event)
    ])

    return event
  }

  public static getEventsByModule: EventService.GetEventsByModule = async (
    module,
    query = {},
    config = {}
  ) => {
    if (config.shouldThrow && !(await ModuleRepo.moduleExists(module))) {
      throw HttpError.NOT_FOUND('Module not found.')
    }

    const repoEvents = await EventRepo.readEventsByModule(module, omit(query, 'parts'))
    const events = repoEvents.map(EventService.createEventFromRepo)

    if (query.parts?.includes('images')) {
      await Promise.all(events.map(EventService.addImages))
    }

    if (query.parts?.includes('flags')) {
      await Promise.all(events.map(EventService.addFlags))
    }

    return events
  }

  public static getEventsWhereIn: EventService.GetEventsWhereIn = async (whereIn, query = {}) => {
    const repoEvents = await EventRepo.readEventsWhereIn(whereIn, omit(query, 'parts'))
    const events = repoEvents.map(EventService.createEventFromRepo)

    if (query.parts?.includes('images')) {
      await Promise.all(events.map(EventService.addImages))
    }

    if (query.parts?.includes('flags')) {
      await Promise.all(events.map(EventService.addFlags))
    }

    return events
  }

  private static async addFlags(event: Event): Promise<void> {
    const repoFlags = await EventRepo.readEventFlags(event.module, event.id)

    event.flags = EventService.createFlagsFromRepo(repoFlags)
  }

  private static async addImages(event: Event): Promise<void> {
    const repoImages = await EventRepo.readEventImages(event.id)

    event.images = repoImages.map(EventService.createImageFromRepo)
  }

  /**
   * Creates an Event object from repo data.
   *
   * @param {number} module - The module identifier.
   * @param {RepoEvent} event - The raw event data from the repo.
   * @param {ReturnType<typeof EventRepo.getImages>} images - Array of images associated with the event.
   * @param {ReturnType<typeof EventRepo.getFlags>} flags - Array of flags associated with the event.
   * @returns {Event} The constructed Event object.
   */

  private static createEventFromRepo(repoEvent: EventRepo.Event): Event {
    const event = new Event(repoEvent.module)
    event.id = repoEvent._id
    event.title = repoEvent.title
    event.startDate = fromUnixTime(repoEvent.startDate)
    event.endDate = fromUnixTime(repoEvent.endDate)
    event.teaser = repoEvent.description
    event.description = repoEvent.details
    event.website = repoEvent.url || undefined
    event.address = repoEvent.address
    event.organizer = repoEvent.presenter
    event.coordinates = [repoEvent.lat, repoEvent.lng]

    if (repoEvent.image) {
      event.image = new Image(repoEvent.image, repoEvent.imageDescription || repoEvent.title)
      event.image.addSrc(repoEvent.thumb as string, 'small')
    }

    if (repoEvent.pdf) {
      event.pdf = new PDF(repoEvent.pdf)
      event.pdf.title = repoEvent.pdfTitle || 'Weitere Informationen'
    }

    return event
  }

  private static createImageFromRepo(repoImage: EventRepo.EventImage): Image {
    return new Image(repoImage.image, repoImage.description)
  }

  private static createFlagsFromRepo(repoFlags: EventRepo.EventFlags): Flags {
    return new Flags(repoFlags)
  }
}

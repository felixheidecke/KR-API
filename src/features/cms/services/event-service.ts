import { fromUnixTime } from 'date-fns'
import { EventRepo } from '../providers/event-repo.js'
import { Event } from '../entities/event.js'
import { Image } from '#common/entities/image.js'
import { PDF } from '#common/entities/pdf.js'
import { HttpError } from '#utils/http-error.js'
import { omit } from 'lodash-es'
import { Flags } from '../entities/flags.js'
import { ModuleRepo } from '#common/providers/module-repo.js'
import { TagRepo } from '../providers/tag-repo.js'

type Config = {
  skipModuleCheck?: boolean
}

type Query = {
  startsBefore?: Date | number
  startsAfter?: Date | number
  endsBefore?: Date | number
  endsAfter?: Date | number
  limit?: number
  offset?: number
  parts?: string[]
}

export namespace EventService {
  export type GetEventById = (module: number, id: number, config?: Config) => Promise<Event>

  export type GetEventsByModule = (module: number, query?: Query) => Promise<Event[]>

  export type GetEventsWhereIn = (
    whereIn: { modules?: number[]; communes?: string[]; tags?: number[] },
    query?: Query
  ) => Promise<Event[]>
}

// --- [ Class ] -----------------------------------------------------------------------------------

export class EventService {
  public static getEventById: EventService.GetEventById = async (module, id, config = {}) => {
    const [moduleExists, repoEvent] = await Promise.all([
      config.skipModuleCheck ? ModuleRepo.moduleExists(module) : Promise.resolve(true),
      EventRepo.readEventById(module, id)
    ])

    if (!moduleExists) {
      throw HttpError.NOT_FOUND('Module not found.')
    }

    if (!repoEvent) {
      throw HttpError.NOT_FOUND('Event not found.')
    }

    const event = this.createEventFromRepo(repoEvent)

    // prettier-ignore
    await Promise.all([
      EventService.addImages(event),
      EventService.addFlags(event),
      EventService.addTags(event)
    ])

    return event
  }

  public static getEventsByModule: EventService.GetEventsByModule = async (module, query = {}) => {
    if (!(await ModuleRepo.moduleExists(module))) {
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

    if (query.parts?.includes('tags')) {
      await Promise.all(events.map(EventService.addTags))
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

  private static async addTags(event: Event): Promise<void> {
    event.tags = await TagRepo.readTagsByEventId(event.id)
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

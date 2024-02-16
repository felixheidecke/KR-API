import { DetailLevel } from '../../shop/utils/detail-level.js'
import { Event } from '../model/Event.js'
import { fromUnixTime, getUnixTime } from 'date-fns'
import { Image } from '../../../common/entities/Image.js'
import { ModuleRepository } from '../../shop/gateways/ModuleRepository.js'
import { PDF } from '../../shop/entities/PDF.js'
import knex from '../../../services/knex.js'

type MinimalRepositoryEvent = {
  _id: number
  module: number
  title: string
  startDate: number
  endDate: number
}

interface RepositoryEvent extends MinimalRepositoryEvent {
  description?: string
  details?: string
  image?: string
  thumb?: string
  imageDescription?: string
  pdf?: string
  pdfName?: string
  pdfTitle?: string
  eventURL?: string | null
  flagset?: number
  address?: string
  detailsURL?: string
  url?: string
  presenter?: string
  lat?: number | null
  lng?: number | null
}

type ReadManyQuery = {
  startsBefore?: number
  startsAfter?: number
  endsBefore?: number
  endsAfter?: number
  limit?: number
}

export class EventRepository {
  /**
   * Reads and returns multiple events based on the provided module and query parameters.
   *
   * @param {number} module - The module identifier.
   * @param {ReadManyQuery} [query] - Optional query parameters to filter events.
   * @returns {Promise<Event[] | null>} A promise that resolves to an array of Event objects or null if the module doesn't exist.
   */

  public static async getEvents(
    module: number,
    query?: ReadManyQuery,
    detailLevel: DetailLevel = 0
  ) {
    if (!(await ModuleRepository.moduleExists(module))) return null

    const eventsQuery = knex('Event')

    if (detailLevel === DetailLevel.MINIMAL) {
      eventsQuery.select('_id', 'title', 'startDate', 'endDate')
    } else {
      eventsQuery.select()
    }

    eventsQuery.where({ module })

    if (query?.startsBefore) {
      eventsQuery.andWhere('startDate', '<', getUnixTime(query.startsBefore))
    }

    if (query?.startsAfter) {
      eventsQuery.andWhere('startDate', '>', getUnixTime(query.startsAfter))
    }

    if (query?.endsBefore) {
      eventsQuery.andWhere('endDate', '<', getUnixTime(query.endsBefore))
    }

    if (query?.endsAfter) {
      eventsQuery.andWhere('endDate', '>', getUnixTime(query.endsAfter))
    }

    if (query?.limit) {
      eventsQuery.limit(query.limit)
    }

    const events = (await eventsQuery.orderBy('startDate')) as RepositoryEvent[]

    return await Promise.all(
      events.map(async event => {
        if (detailLevel <= DetailLevel.BASIC) {
          return this.createEventFromRepositoryData(module, event)
        } else {
          return this.createEventFromRepositoryData(
            module,
            event,
            await EventRepository.getImages(event._id),
            await EventRepository.getFlags(event._id)
          )
        }
      })
    )
  }

  /**
   * Reads and returns a single event based on the provided module and id.
   *
   * @param {number} module - The module identifier.
   * @param {number} id - The event identifier.
   * @returns {Promise<Event | null>} A promise that resolves to an Event object or null if not found.
   */

  public static async getEvent(module: number, id: number) {
    const event = (await knex('Event').where({ module, _id: id }).first()) as RepositoryEvent | null

    if (!event) return null

    const [images, flags] = await Promise.all([
      EventRepository.getImages(id),
      EventRepository.getFlags(id)
    ])

    return this.createEventFromRepositoryData(module, event, images, flags)
  }

  /**
   * Reads and returns images associated with a specific event.
   *
   * @param {number} id - The event identifier.
   * @returns {Promise<{ image: string; description: string }[]>} A promise that resolves to an array of images and their descriptions.
   */

  public static async getImages(id: number): Promise<{ image: string; description: string }[]> {
    return knex('EventImage')
      .select('image', 'description')
      .where({ event: id })
      .orderBy('position')
  }

  /**
   * Reads and returns flags associated with a specific event.
   *
   * @param {number} id - The event identifier.
   * @returns {Promise<string[]>} A promise that resolves to an array of flag titles.
   */

  public static async getFlags(id: number): Promise<string[]> {
    const flags = await knex('Flag').select('title').where({ flagset: id })

    return flags.map(({ title }) => title)
  }

  /**
   * Creates an Event object from repository data.
   *
   * @param {number} module - The module identifier.
   * @param {RepositoryEvent} event - The raw event data from the repository.
   * @param {ReturnType<typeof EventRepository.getImages>} images - Array of images associated with the event.
   * @param {ReturnType<typeof EventRepository.getFlags>} flags - Array of flags associated with the event.
   * @returns {Event} The constructed Event object.
   */

  private static createEventFromRepositoryData(
    module: number,
    event: RepositoryEvent,
    images?: Awaited<ReturnType<typeof EventRepository.getImages>>,
    flags?: Awaited<ReturnType<typeof EventRepository.getFlags>>
  ) {
    const newEvent = new Event(module)
    newEvent.id = event._id
    newEvent.title = event.title
    newEvent.startDate = fromUnixTime(event.startDate)
    newEvent.endDate = fromUnixTime(event.endDate)
    newEvent.description = event.description
    newEvent.details = event.details
    newEvent.website = event.eventURL || undefined
    newEvent.address = event.address
    newEvent.coordinates = event.lat && event.lng ? [event.lat, event.lng] : [0, 0]
    newEvent.flags = flags

    if (event.image) {
      newEvent.image = new Image(event.image, event.imageDescription || event.title)
      newEvent.image.addSrc(event.thumb as string, 'small')
    }

    if (event.pdf) {
      newEvent.pdf = new PDF(event.pdf)
      newEvent.pdf.title = event.pdfTitle as string
    }

    if (images?.length) {
      images.forEach(({ image, description }) => {
        newEvent.addImage(new Image(image, description))
      })
    }

    return newEvent
  }
}

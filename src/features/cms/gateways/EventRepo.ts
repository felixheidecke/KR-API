import { DetailLevel } from '../../shop/utils/detail-level.js'
import { getUnixTime } from 'date-fns'
import knex from '../../../modules/knex.js'
import path from 'path'

const DATA_BASE_PATH = 'https://www.rheingau.de/data'

export type RepoEvent = {
  _id: number
  module: number
  title: string
  startDate: number
  endDate: number
  description?: string
  details?: string
  image?: string
  thumb?: string
  imageDescription?: string
  pdf?: string
  pdfName?: string
  pdfTitle?: string
  eventURL?: string | null
  images?: RepoEventImage[]
  flags?: RepoEventFlag[]
  address?: string
  detailsURL?: string
  url?: string
  presenter?: string
  lat?: number | null
  lng?: number | null
}

type RepoEventImage = {
  image: string
  description: string
}

type RepoEventFlag = string

export class EventRepo {
  /**
   * Reads and returns multiple events based on the provided module and query parameters.
   *
   * @param {number} module - The module identifier.
   * @param {object} [query] - Optional query parameters to filter events.
   * @returns {Promise<Event[] | null>} A promise that resolves to an array of Event objects or null if the module doesn't exist.
   */

  public static async readEvents(
    module: number,
    query?: {
      startsBefore?: Date | number
      startsAfter?: Date | number
      endsBefore?: Date | number
      endsAfter?: Date | number
      limit?: number
      detailLevel?: DetailLevel
    }
  ): Promise<RepoEvent[] | null> {
    const detailLevel = query?.detailLevel || DetailLevel.DEFAULT
    const eventsQuery = knex('Event')

    if (detailLevel === DetailLevel.MINIMAL) {
      eventsQuery.select('_id', 'module', 'title', 'startDate', 'endDate')
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

    let events = await eventsQuery.orderBy('startDate')

    if (!events) return null

    if (detailLevel >= DetailLevel.DEFAULT) {
      events = events.map(event => ({
        ...event,
        pdf: event.pdf ? DATA_BASE_PATH + '/' + event.pdf : undefined,
        image: event.image ? DATA_BASE_PATH + '/' + event.image : undefined,
        thumb: event.thumb ? DATA_BASE_PATH + '/' + event.thumb : undefined
      }))
    }

    if (detailLevel === DetailLevel.EXTENDED) {
      events = await Promise.all(
        events.map(async event => {
          const [images, flags] = await Promise.all([
            EventRepo.readImages(event._id),
            EventRepo.readFlags(event._id)
          ])

          return {
            ...event,
            images: images || undefined,
            flags: flags || undefined
          }
        })
      )
    }

    return events
  }

  /**
   * Reads and returns a single event based on the provided module and id.
   *
   * @param {number} module - The module identifier.
   * @param {number} id - The event identifier.
   * @returns {Promise<Event | null>} A promise that resolves to an Event object or null if not found.
   */

  public static async readEvent(module: number, id: number): Promise<RepoEvent | null> {
    const eventQuery = knex('Event').where({ module, _id: id }).first()

    const [event, images, flags] = await Promise.all([
      eventQuery,
      EventRepo.readImages(id),
      EventRepo.readFlags(id)
    ])

    return {
      ...event,
      pdf: event.pdf ? DATA_BASE_PATH + '/' + event.pdf : undefined,
      image: event.image ? DATA_BASE_PATH + '/' + event.image : undefined,
      thumb: event.thumb ? DATA_BASE_PATH + '/' + event.thumb : undefined,
      images: images || undefined,
      flags: flags || undefined
    }
  }

  /**
   * Reads and returns images associated with a specific event.
   *
   * @param {number} id - The event identifier.
   * @returns {Promise<{ image: string; description: string }[]>} A promise that resolves to an array of images and their descriptions.
   */

  private static async readImages(id: number): Promise<RepoEventImage[] | null> {
    const repoImagesQuery = knex('EventImage')
      .select('image', 'description')
      .where({ event: id })
      .orderBy('position')

    const repoImages = (await repoImagesQuery) as RepoEventImage[]

    return repoImages
      ? repoImages.map(repoImage => ({
          image: DATA_BASE_PATH + '/' + repoImage.image,
          description: repoImage.description
        }))
      : null
  }

  /**
   * Reads and returns flags associated with a specific event.
   *
   * @param {number} id - The event identifier.
   * @returns {Promise<string[]>} A promise that resolves to an array of flag titles.
   */

  private static async readFlags(id: number): Promise<RepoEventFlag[] | null> {
    const flags = await knex('Flag').select('title').where({ flagset: id })

    return flags.map(({ title }) => title)
  }
}

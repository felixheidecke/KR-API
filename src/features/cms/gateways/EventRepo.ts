import { getUnixTime } from 'date-fns'
import knex from '../../../modules/knex.js'
import type { Knex } from 'knex'
import { DATA_BASE_PATH } from '../../../common/utils/constants.js'

export namespace EventRepo {
  export type Event = {
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
    flagset: number | null
    pdf?: string
    pdfName?: string
    pdfTitle?: string
    address?: string
    detailsURL?: string
    url?: string
    presenter?: string
    lat?: number | null
    lng?: number | null
  }

  export type EventImage = {
    image: string
    description: string
  }

  export type EventFlag = string
}
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
    query: {
      startsBefore?: Date | number
      startsAfter?: Date | number
      endsBefore?: Date | number
      endsAfter?: Date | number
      limit?: number
    } = {}
  ): Promise<EventRepo.Event[]> {
    return await new EventQueryBuilder(module)
      .startsBefore(query.startsBefore)
      .startsAfter(query.startsAfter)
      .endsBefore(query.endsBefore)
      .endsAfter(query.endsAfter)
      .readMany(query.limit)
  }

  /**
   * Reads and returns a single event based on the provided module and id.
   *
   * @param {number} module - The module identifier.
   * @param {number} id - The event identifier.
   * @returns {Promise<Event | null>} A promise that resolves to an Event object or null if not found.
   */

  public static async readEvent(module: number, id: number): Promise<EventRepo.Event | null> {
    return await new EventQueryBuilder(module).readOne(id)
  }

  /**
   * Reads and returns images associated with a specific event.
   *
   * @param {number} id - The event identifier.
   * @returns {Promise<{ image: string; description: string }[]>} A promise that resolves to an array of images and their descriptions.
   */

  public static async readEventImages(id: number): Promise<EventRepo.EventImage[]> {
    return knex('EventImage')
      .select(knex.raw(`CONCAT('${DATA_BASE_PATH}/', image)as image`), 'description')
      .where({ event: id })
      .orderBy('position')
  }

  /**
   * Reads and returns flags associated with a specific event.
   *
   * @param {number} id - The event identifier.
   * @returns {Promise<string[]>} A promise that resolves to an array of flag titles.
   */

  public static async readEventFlags(module: number, id: number): Promise<EventRepo.EventFlag[]> {
    return knex
      .select('Flag.title')
      .from('Event')
      .rightJoin('Flag', 'Event.flagset', 'Flag.flagset')
      .where({ 'Event._id': id, 'Event.module': module })
      .then(rows => rows.map(({ title }) => title))
  }
}

class EventQueryBuilder {
  constructor(private readonly module: number) {
    this._query = knex('Event')
      .select(
        '_id',
        'title',
        'startDate',
        'endDate',
        'description',
        'details',
        knex.raw(
          `IF(image IS NULL OR image = '', NULL, CONCAT('${DATA_BASE_PATH}/', image)) AS image`
        ),
        knex.raw(
          `IF(thumb IS NULL OR thumb = '', NULL, CONCAT('${DATA_BASE_PATH}/', thumb)) AS thumb`
        ),
        knex.raw('CAST(imageDescription AS CHAR) as imageDescription'),
        knex.raw(`IF(pdf IS NULL OR pdf = '', NULL, CONCAT('${DATA_BASE_PATH}/', pdf)) AS pdf`),
        knex.raw('CAST(pdfName AS CHAR) as pdfName'),
        knex.raw('CAST(pdfTitle AS CHAR) as pdfTitle'),
        knex.raw('CAST(commune AS CHAR) as commune'),
        'module',
        'address',
        'detailsURL',
        'url',
        'presenter',
        'lat',
        'lng'
      )
      .where({ 'Event.module': module })
  }

  private _query: Knex.QueryBuilder

  public startsBefore(date?: Date | number) {
    if (date) {
      this._query.andWhere('Event.startDate', '<', getUnixTime(date))
    }

    return this
  }

  public startsAfter(date?: Date | number) {
    if (date) {
      this._query.andWhere('Event.startDate', '>', getUnixTime(date))
    }

    return this
  }

  public endsBefore(date?: Date | number) {
    if (date) {
      this._query.andWhere('Event.endDate', '<', getUnixTime(date))
    }
    return this
  }

  public endsAfter(date?: Date | number) {
    if (date) {
      this._query.andWhere('Event.endDate', '>', getUnixTime(date))
    }

    return this
  }

  public async readOne(id: number): Promise<EventRepo.Event | null> {
    const event = await this._query
      .andWhere({ 'Event.module': this.module, 'Event._id': id })
      .first()

    return event || null
  }

  public async readMany(limit = 1000): Promise<EventRepo.Event[]> {
    return await this._query.orderBy('Event.startDate').limit(limit)
  }
}

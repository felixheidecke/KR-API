import { getUnixTime } from 'date-fns'
import knex from '../../../modules/knex.js'
import type { Knex } from 'knex'
import { MEDIA_BASE_PATH } from '../../../constants.js'

export namespace EventRepo {
  export type Event = {
    _id: number
    module: number
    title: string
    startDate: number
    endDate: number
    description: string
    details: string
    image: string
    thumb: string
    imageDescription: string
    pdf: string
    pdfName: string
    pdfTitle: string
    address: string
    detailsURL: string
    url: string
    presenter: string
    lat: string
    lng: string
  }

  export type EventImage = {
    image: string
    description: string
  }

  export type EventFlags = string[]
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
      .select(knex.raw(`CONCAT('${MEDIA_BASE_PATH}/', image)as image`), 'description')
      .where({ event: id })
      .orderBy('position')
  }

  /**
   * Reads and returns flags associated with a specific event.
   *
   * @param {number} id - The event identifier.
   * @returns {Promise<string[]>} A promise that resolves to an array of flag titles.
   */

  public static async readEventFlags(module: number, id: number): Promise<EventRepo.EventFlags> {
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
        'module',
        'title',
        'startDate',
        'endDate',
        knex.raw('IF(description = "", NULL, description) AS description'),
        knex.raw('IF(details = "", NULL, details) AS details'),
        knex.raw(`IF(image = "", NULL, CONCAT('${MEDIA_BASE_PATH}/', image)) AS image`),
        knex.raw(`IF(thumb = "", NULL, CONCAT('${MEDIA_BASE_PATH}/', thumb)) AS thumb`),
        knex.raw(`IF(imageDescription = '', NULL, imageDescription) AS imageDescription`),
        knex.raw(`IF(pdf = '', NULL, CONCAT('${MEDIA_BASE_PATH}/', pdf)) AS pdf`),
        knex.raw(`IF(pdfName = '', NULL, pdfName) AS pdfName`),
        knex.raw(`IF(pdfTitle = '', NULL, pdfTitle) AS pdfTitle`),
        knex.raw(`IF(commune = '' OR commune = '-', NULL, commune) AS commune`),
        knex.raw(`IF(address = '', NULL, address) AS address`),
        knex.raw(`IF(url = '', NULL, url) AS url`),
        knex.raw(`IF(detailsURL = '', NULL, detailsURL) AS detailsURL`),
        knex.raw(`IF(presenter = '', NULL, presenter) AS presenter`),
        knex.raw(`IF(lat = '0.000000', NULL, lat) AS lat`),
        knex.raw(`IF(lng = '0.000000', NULL, lng) AS lng`)
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

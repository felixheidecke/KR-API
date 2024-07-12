import { fromUnixTime } from 'date-fns'
import { isNumber } from 'lodash-es'
import { toUrlSlug } from '#utils/slugify.js'

import type { Image } from '#common/entities/image.js'
import type { PDF } from '#common/entities/pdf.js'
import type { Flags } from './flags.js'
import { handleText } from '../utils/handle-text.js'

export class Event {
  constructor(readonly module: number) {}

  protected _coordinates: [number, number] = [0, 0]
  protected _endDate?: Date
  protected _startDate?: Date
  protected _slug: string = ''
  protected _title: string = ''

  public id: number = 0
  public address?: string | null
  public teaser?: string | null
  public description?: string | null
  public flags?: Flags
  public image?: Image
  public images?: Image[]
  public organizer?: string
  public pdf?: PDF
  public ticketshop?: string
  public website?: string

  // --- [ Getter ] --------------------------------------------------------------------------------

  get title() {
    return this._title
  }

  get slug() {
    return this._slug
  }

  get coodinates() {
    const [lat, lng] = this._coordinates

    if (lat + lng === 0) {
      return null
    } else {
      return this._coordinates
    }
  }

  // --- [ Setter ] --------------------------------------------------------------------------------

  set title(title: string) {
    this._title = title.trim()
    this._slug = toUrlSlug(this._title, 75)
  }

  set startDate(date: Date | number | string) {
    this._startDate = isNumber(date) ? fromUnixTime(date) : new Date(date)
  }

  set endDate(date: Date | number | string) {
    this._endDate = isNumber(date) ? fromUnixTime(date) : new Date(date)
  }

  set coordinates([lat, lng]: [number | string, number | string]) {
    this._coordinates = [+lat, +lng]
  }

  // --- [ Methods ] -------------------------------------------------------------------------------

  addImage(image: Image) {
    if (!this.images) {
      this.images = []
    }

    this.images.push(image)

    return this
  }

  display() {
    return Object.freeze({
      id: +this.id,
      module: +this.module,
      slug: this.slug,
      title: this.title,
      teaser: this.teaser ? handleText(this.teaser) : null,
      description: this.description ? handleText(this.description) : null,
      address: this.address,
      starts: this._startDate?.toISOString() || null,
      ends: this._endDate?.toISOString() || null,
      image: this.image?.display() || null,
      pdf: this.pdf?.display() || null,
      website: this.website,
      ticketshop: this.ticketshop,
      organizer: this.organizer,
      coordinates: this.coodinates,
      flags: this.flags?.display(),
      images: this.images?.map(image => image.display())
    })
  }
}

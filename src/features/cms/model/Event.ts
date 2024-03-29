// @ts-ignore
import textile from 'textile-js'
import { fromUnixTime } from 'date-fns'
import { isNumber } from 'lodash-es'
import { toUrlSlug } from '../../../common/utils/slugify.js'

import type { Image } from '../../../common/entities/Image.js'
import type { PDF } from '../../shop/entities/PDF.js'

export class Event {
  constructor(readonly module: number) {}

  protected _coordinates: [number, number] = [0, 0]
  protected _endDate?: Date
  protected _slug: string = ''
  protected _startDate?: Date
  protected _title: string = ''
  public address?: string
  public description?: string
  public details?: string
  public flags?: string[]
  public id: number = 0
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
      return undefined
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

  set coordinates([lat, lng]: [number, number]) {
    this._coordinates = [+lat, +lng]
  }

  // --- [ Methods ] -------------------------------------------------------------------------------

  addImage(image: Image) {
    if (!this.images) {
      this.images = []
    }

    this.images.push(image)
  }

  display() {
    return Object.freeze({
      $id: +this.id,
      $module: +this.module,
      slug: this.slug,
      title: this.title,
      description: this.description ? textile.parse(this.description) : undefined,
      details: this.details ? textile.parse(this.details) : undefined,
      address: this.address?.trim(),
      starts: this._startDate?.toString(),
      ends: this._endDate?.toString(),
      image: this.image?.display(),
      pdf: this.pdf?.display(),
      website: this.website,
      ticketshop: this.ticketshop,
      organizer: this.organizer,
      coordinates: this.coodinates,
      flags: this.flags,
      images: this.images?.map(image => image.display())
    })
  }
}

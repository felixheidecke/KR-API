import { ASSET_BASE_URL } from '#constants'
import { fromUnixTime } from 'date-fns'
import { toUrlSlug } from '#libs/slugify'
import database from '#libs/database'
import SimpleQuery from '#libs/simple-query-builder'
import textile from 'textile-js'

export default class Event {
  #id

  // Data
  #event = {}
  #images = []
  #flags = []

  constructor(id) {
    if (!id) {
      throw new Error('Missing required parameter "id"')
    }

    this.#id = id
  }

  get id() {
    return this.#event._id
  }

  get module() {
    return this.#event.module
  }

  get slug() {
    return this.#event.title ? toUrlSlug(this.#event.title) : undefined
  }

  get title() {
    return this.#event.title ? this.#event.title.trim() : undefined
  }

  get description() {
    return this.#event.description
      ? textile.parse(this.#event.description)
      : undefined
  }

  get details() {
    return this.#event.details ? textile.parse(this.#event.details) : undefined
  }

  get starts() {
    return fromUnixTime(this.#event.startDate).toString()
  }

  get ends() {
    return fromUnixTime(this.#event.endDate).toString()
  }

  get image() {
    const { image, thumb, imageDescription } = this.#event

    return image
      ? {
          src: ASSET_BASE_URL + image,
          thumbSrc: thumb ? ASSET_BASE_URL + thumb : undefined,
          alt: imageDescription || ''
        }
      : undefined
  }

  get pdf() {
    const { pdf, pdfName, pdfTitle } = this.#event

    return pdf
      ? {
          src: ASSET_BASE_URL + pdf,
          name: pdfName || '',
          title: pdfTitle ? pdfTitle.trim() : 'Weitere Infos'
        }
      : undefined
  }

  get website() {
    return this.#event.detailsURL || undefined
  }

  get ticketshop() {
    return this.#event.url || undefined
  }

  get organizer() {
    return this.#event.presenter || undefined
  }

  get coordinates() {
    return +this.#event.lat > 0 && +this.#event.lng > 0
      ? {
          lat: +this.#event.lat,
          lng: +this.#event.lng
        }
      : undefined
  }

  get flags() {
    if (!this.#flags.length) return undefined

    return this.#flags.map(({ title }) => title)
  }

  get images() {
    if (!this.#images.length) return undefined

    return this.#images.map(({ image, description }) => ({
      src: ASSET_BASE_URL + image,
      alt: description || ''
    }))
  }

  get data() {
    return {
      id: this.id,
      module: this.module,
      slug: this.slug,
      title: this.title,
      description: this.description,
      details: this.details,
      starts: this.starts,
      ends: this.ends,
      image: this.image,
      pdf: this.pdf,
      website: this.website,
      ticketshop: this.ticketshop,
      organizer: this.organizer,
      coordinates: this.coordinates,
      flags: this.flags,
      images: this.images
    }
  }

  get length() {
    return this.id ? 1 : 0
  }

  async load({ parts }) {
    this.#event = (await Event.fetchEvent(this.#id)) || {}

    if (parts?.includes('flags') && this.#event.flagset) {
      this.#flags = (await Event.fetchFlags(this.#event.flagset)) || []
    }

    if (parts?.includes('images') && this.#event._id) {
      this.#images = (await Event.fetchImages(this.#event._id)) || []
    }
  }

  static async fetchEvent(id) {
    const sql = new SimpleQuery()
      .select('*')
      .from('rtd.Event')
      .where('_id = ?')
      .limit(1)

    const [rows] = await database.execute(sql.query, [id])

    return rows.length ? rows[0] : null
  }

  static async fetchImages(id) {
    const sql = new SimpleQuery()
      .select(['image', 'description'])
      .from('rtd.EventImage')
      .where('event = ' + id)
      .order('position')

    const [rows] = await database.execute(sql.query)

    return rows.length ? rows : null
  }

  static async fetchFlags(flagset) {
    const sql = new SimpleQuery()
      .select('title')
      .from('rtd.Flag')
      .where('flagset = ?')

    const [rows] = await database.execute(sql.query, [flagset])

    return rows.length ? rows : null
  }

  import({ event, images, flags }) {
    this.#event = event
    this.#images = images
    this.#flags = flags

    return this
  }

  export() {
    return {
      event: this.#event,
      images: this.#images,
      flags: this.#flags
    }
  }

  from(event) {
    if (event.name !== 'Event') return

    this.import(event.export())
  }
}

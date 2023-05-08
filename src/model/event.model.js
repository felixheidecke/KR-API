import SimpleQuery from '#libs/simple-query-builder'
import database from '#libs/database'
import { toUrlSlug } from '#libs/slugify'
import { fromUnixTime } from 'date-fns'
import textile from 'textile-js'
import { ASSET_BASE_URL } from '#constants'

export default class Event {
  #event = {}
  #images = []
  #flags = []

  _constructor(event) {
    if (!event) return

    this.import(event)
  }

  // --- [ Getter ] ------------------------------------------------------------

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

  get hasData() {
    return !!(Object.keys(this.#event).length || this.#images.length)
  }

  async load(id, config = {}) {
    this.#event = (await fetchEvent(id)) || {}

    if (this.#event.flagset) {
      this.#flags = (await fetchFlags(this.#event.flagset)) || []
    }

    if (config.parts?.includes('images')) {
      this.#images = (await fetchImages(id)) || []
    }

    return this
  }

  async safe() {
    return this
  }

  import(data) {
    const { event, images, flags } = data

    if (event) {
      this.#event = Object.assign({}, event)
    }

    if (images) {
      this.#images = Object.assign({}, images)
    }

    if (flags) {
      this.#flags = Object.assign({}, flags)
    }

    return this
  }

  export() {
    return Object.assign(
      {},
      {
        event: this.#event,
        images: this.#images,
        flags: this.#flags
      }
    )
  }
}

// --- [ Static Methods ] ------------------------------------------------------

export async function fetchEvent(id) {
  const query = new SimpleQuery()
    .select('*')
    .from('rtd.Event')
    .where('_id = ?')
    .limit(1)

  const [rows] = await database.execute(query.query, [id])

  if (!rows.length) return

  return rows[0]
}

export async function fetchImages(id) {
  const query = new SimpleQuery()

  query
    .select(['image', 'description'])
    .from('rtd.EventImage')
    .where('event = ?')
    .order('position')

  const [rows] = await database.execute(query.query, [id])

  if (!rows.length) return

  return rows
}

export async function fetchFlags(flagset) {
  const query = new SimpleQuery()

  query.select('title').from('rtd.Flag').where('flagset = ?')

  const [rows] = await database.execute(query.query, [flagset])

  if (!rows.length) return

  return rows
}

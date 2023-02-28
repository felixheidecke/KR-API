import SimpleQuery from '#libs/simple-query-builder'
import database from '#libs/database'
import { toUrlSlug } from '#libs/slugify'
import { fromUnixTime } from 'date-fns'
import textile from 'textile-js'
import { ASSET_BASE_URL } from '#constants'

export async function getEvent(id = 0, config = {}) {
  // --- Data ---

  let event = {}
  let images = []
  let flags = []

  // --- Initialise ---

  if (id) {
    await fetchEvent()
  }

  if (id && config.full) {
    await fetchImages()
    await fetchFlags()
  }

  function getId() {
    return event._id
  }

  function getModule() {
    return event.module
  }

  function getSlug() {
    return event.title ? toUrlSlug(getTitle()) : undefined
  }

  function getTitle() {
    return event.title ? event.title.trim() : undefined
  }

  function getDescription() {
    return event.description ? textile.parse(event.description) : undefined
  }

  function getDetails() {
    return event.details ? textile.parse(event.details) : undefined
  }

  function getStarts() {
    return fromUnixTime(event.startDate).toString()
  }

  function getEnds() {
    return fromUnixTime(event.endDate).toString()
  }

  function getImage() {
    const { image, thumb, imageDescription } = event

    return image
      ? {
          src: ASSET_BASE_URL + image,
          thumbSrc: thumb ? ASSET_BASE_URL + thumb : undefined,
          alt: imageDescription || ''
        }
      : undefined
  }

  function getPdf() {
    const { pdf, pdfName, pdfTitle } = event

    return pdf
      ? {
          src: ASSET_BASE_URL + pdf,
          name: pdfName || '',
          title: pdfTitle ? pdfTitle.trim() : 'Weitere Infos'
        }
      : undefined
  }

  function getWebsite() {
    return event.detailsURL || undefined
  }

  function getTicketshop() {
    return event.url || undefined
  }

  function getOrganizer() {
    return event.presenter || undefined
  }

  function getCoordinates() {
    return +event.lat > 0 && +event.lng > 0
      ? {
          lat: +event.lat,
          lng: +event.lng
        }
      : undefined
  }

  function getFlags() {
    if (!flags.length) return undefined

    return flags.map(({ title }) => title)
  }

  function getImages() {
    if (!images.length) return undefined

    return images.map(({ image, description }) => ({
      src: ASSET_BASE_URL + image,
      alt: description || ''
    }))
  }

  function get() {
    return {
      id: getId(),
      module: getModule(),
      slug: getSlug(),
      title: getTitle(),
      description: getDescription(),
      details: getDetails(),
      starts: getStarts(),
      ends: getEnds(),
      image: getImage(),
      pdf: getPdf(),
      website: getWebsite(),
      ticketshop: getTicketshop(),
      organizer: getOrganizer(),
      coordinates: getCoordinates(),
      flags: getFlags(),
      images: getImages()
    }
  }

  async function fetchEvent() {
    const query = new SimpleQuery()
      .select('*')
      .from('rtd.Event')
      .where('_id = ?')
      .limit(1)

    const [rows] = await database.execute(query.query, [id])

    if (!rows.length) return

    event = rows[0]
  }

  async function fetchImages() {
    const query = new SimpleQuery()

    query
      .select(['image', 'description'])
      .from('rtd.EventImage')
      .where('event = ?')
      .order('position')

    const [rows] = await database.execute(query.query, [id])

    if (!rows.length) return

    images = rows
  }

  async function fetchFlags() {
    const query = new SimpleQuery()

    query.select('title').from('rtd.Flag').where('flagset = ?')

    const [rows] = await database.execute(query.query, [event.flagset])

    if (!rows.length) return

    flags = rows
  }

  function importData(data) {
    event = data.event || event
    images = data.images || event
    flags = data.flags || event
  }

  function updateData(data) {
    if (data.event) {
      Object.assign(event, data.event)
    }

    if (data.images) {
      images = images.concat(data.images)
    }

    if (data.flags) {
      flags = flags.concat(data.flags)
    }
  }

  function exportData() {
    return { event, images, flags }
  }

  return {
    get,
    getId,
    getModule,
    getSlug,
    getTitle,
    getDescription,
    getDetails,
    getStarts,
    getEnds,
    getImage,
    getPdf,
    getWebsite,
    getTicketshop,
    getOrganizer,
    getCoordinates,
    getFlags,
    getImages,
    import: importData,
    export: exportData,
    update: updateData
  }
}

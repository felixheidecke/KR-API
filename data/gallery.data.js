import database from '#libs/database'

export class Gallery {
  constructor(id, type = 'module') {
    this._galleries = []
    this._type = type
    this._ids = []
    this._module = 0

    switch (type) {
      case 'module':
        this._module = id
        this._ids = []
        break

      case 'album':
        this._ids = [id]
        this._module = 0
        break
    }
  }

  /**
   * Set module, wich represents multiple albums
   *
   * @param {number|string} module
   * @returns {object} instance
   */

  setModule = (module) => {
    this._module = +module
    return this
  }

  /**
   * Set album id
   *
   * @param {number|string} id
   * @returns {object} instance
   */

  setAlbum = (id) => {
    this._ids.push(+id)
    return this
  }

  /**
   * Execute data-fetching
   *
   * @returns {Promise<object>} instance
   */

  exec = async () => {
    if (this._galleries.length) {
      console.log('Data is already there')
      return
    }

    await this._fetchIDsFromModule()

    if (!this._ids.length) throw new Error('No albums to get')

    await Promise.all(
      this._ids.reduce((acc, id) => [...acc, this._fetchAlbum(id)], [])
    )

    return this
  }

  /**
   * Return album(s)
   */

  get = async () => {
    await this.exec()

    if (this._type === 'album') {
      return this._galleries[0]
    }

    if (this._type === 'module') {
      return this._galleries
    }
  }

  // --- [ PRIVATE ] -----------------------------------------------------------

  _fetchIDsFromModule = async () => {
    if (!this._module) return
    await this._fetchGalleryIds(this._module)
    this._module = 0
  }

  _fetchGalleryIds = async (module) => {
    if (!module)
      return new Error(
        'Missing required param "module" in Gallery._fetchGalleryIds()'
      )

    const query = `
      SELECT   _id as id
      FROM     rtd.PhotoAlbum
      WHERE    module = ?
      ORDER BY priority ASC`

    try {
      const [ids] = await database.execute(query, [module])

      if (!ids.length) return

      this._ids = ids.map(({ id }) => id)
    } catch (error) {
      console.error(error)
      return
    }
  }

  _fetchAlbum = async (id) => {
    if (!id) return new Error('Missing required param "id" in getAlbum()')

    if (this._galleries.find((album) => album.id === id)) return

    const query = `
      SELECT _id, title, module
      FROM   rtd.PhotoAlbum
      WHERE  _id = ?
      LIMIT  1`

    try {
      const [albums] = await database.execute(query, [id])

      if (!albums.length) return

      const index =
        this._galleries.findIndex((album) => album.id === id) || null
      const album = {
        ...remapAlbum(albums[0]),
        images: await getPhotos(id)
      }

      if (index) {
        this._galleries.push(album)
      } else {
        this._galleries[index] = album
      }
    } catch (error) {
      console.error(error)
      return
    }
  }
}

// Helper

const getPhotos = async (albumId) => {
  if (!albumId)
    return new Error(
      'Missing required param "albumId" in Gallery._fetchPhotos()'
    )

  const query = `
    SELECT _id as id, description, filename, image, priority, album, module
    FROM   rtd.Photo
    WHERE  album = ?
    ORDER BY priority ASC`

  try {
    const [photos] = await database.execute(query, [albumId])

    if (!photos.length) return

    return photos.map((photo) => remapFoto(photo))
  } catch (error) {
    console.error(error)
    return
  }
}

const remapAlbum = ({ _id, title, module }) => {
  return {
    id: _id,
    title,
    module,
    images: []
  }
}

const remapFoto = (photo) => {
  const baseUrl = 'https://cdn.klickrhein.de/xioni/gallery.php'
  const { id, description, filename, image, priority, album } = photo
  const normalizedDescription = description ? description.trim() : ''

  return {
    id,
    album,
    description: normalizedDescription,
    order: priority,
    image: {
      src: `${baseUrl}?${image}/${filename}`,
      alt: normalizedDescription
    }
  }
}

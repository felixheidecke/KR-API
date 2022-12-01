import { toUrlSlug } from '#libs/slugify'
import { head } from 'lodash-es'

// --- Adapter -----------------------------------------------------------------

export const albumAdapter = (gallery) => {
  const album = head(gallery)

  return {
    id: +album.id,
    module: +album.module,
    title: album.title.trim(),
    order: +album.album_sort,
    photos: gallery.map(fotoAdapter)
  }
}

export const fotoAdapter = (path, name, sort, alt) => {
  const baseUrl = 'https://cdn.klickrhein.de/xioni/gallery.php'
  name = toUrlSlug(filename)

  return {
    src: `${baseUrl}?${path}/${filename}`,
    thumbSrc: `${baseUrl}?${path}_thumb/${filename}`,
    alt: alt || '',
    order: +sort
  }
}

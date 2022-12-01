import { toUrlSlug } from '#libs/slugify'

// --- Adapter -----------------------------------------------------------------

export const albumAdapter = (gallery) => {
  const album = gallery[0]

  return {
    id: +album.id,
    module: +album.module,
    slug: toUrlSlug(album.title),
    title: album.title.trim(),
    order: +album.album_sort,
    photos: gallery.map(fotoAdapter)
  }
}

export const fotoAdapter = ({ path, name, sort, alt }) => {
  const baseUrl = 'https://cdn.klickrhein.de/xioni/gallery.php'
  name = toUrlSlug(name)

  return {
    src: `${baseUrl}?${path}/${name}`,
    thumbSrc: `${baseUrl}?${path}_thumb/${name}`,
    alt: alt || '',
    order: +sort
  }
}

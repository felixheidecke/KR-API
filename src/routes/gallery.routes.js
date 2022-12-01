import * as cache from '#hooks/cache'
import { getAlbumController, getGalleryController } from '#controller/gallery'

export default async (App) => {
  App.route({
    ...routeTemplate,
    url: '/gallery/:id',
    handler: getGalleryController
  })

  App.route({
    ...routeTemplate,
    url: '/gallery/album/:id',
    handler: getAlbumController
  })
}

const routeTemplate = {
  method: 'GET',
  onRequest: cache.onRequest,
  preHandler: cache.preHandler,
  onResponse: cache.onResponse
}

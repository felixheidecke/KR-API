import { cacheNoStore } from '#hooks/header'
import { cookiePreHandler } from './_utils.js'

export default async (App) => {
  App.route({
    method: 'GET',
    url: '/shop/cart',
    onRequest: cacheNoStore,
    preHandler: cookiePreHandler,
    handler: async ({ cart }, response) => response.send(cart)
  })
}

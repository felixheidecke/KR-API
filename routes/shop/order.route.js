import { getOrder } from '#data/shop/order'

export default async (App) => {
  App.route({
    method: 'GET',
    url: '/shop/order',
    handler: async (_, response) => {
      const data = await getOrder()

      response.send(data)
    }
  })
}

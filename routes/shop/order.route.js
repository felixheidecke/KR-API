import { generateClientToken } from '#data/paypal/access-token'
// import { getOrder } from '#data/shop/order'

export default async (App) => {
  App.route({
    method: 'GET',
    url: '/shop/order',
    handler: async (_, response) => {
      const data = await generateClientToken(1511)

      response.send(data)
    }
  })
}

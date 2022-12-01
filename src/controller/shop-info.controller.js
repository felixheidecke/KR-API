import { catchHandler } from '#utils/controller'
import {
  getOwnerInfo,
  getShippingCharges,
  getShippingRates
} from '#data/shop-info'

/**
 *
 * @param {import("fastify").FastifyRequest} request
 * @param {import("fastify").FastifyReply} response
 */

export const getShopInfoController = async (request, response) => {
  const { module } = request.params
  try {
    const [owner, charges, rates] = await Promise.all([
      getOwnerInfo(module),
      getShippingCharges(module),
      getShippingRates(module)
    ])

    request.data = {
      ...owner,
      shipping: {
        ...charges,
        rates
      }
    }

    response.send(request.data)
  } catch (error) {
    catchHandler(response, error)
  }
}

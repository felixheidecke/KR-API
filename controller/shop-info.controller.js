import {
  catchHandler,
  sendDataHandler,
  sendNotFoundHandler
} from '#utils/controller.helper'
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

    if (!owner) {
      sendNotFoundHandler(response)
    } else {
      sendDataHandler(response, request, {
        ...owner,
        shipping: {
          ...charges,
          rates
        }
      })
    }
  } catch (error) {
    catchHandler(response, error)
  }
}

import { cacheNoStore as setCacheNoStoreHeader } from '#src/hooks/headerHooks'
import { sign, verify } from '#libs/jwt'
import { Shop3Cart } from '#src/model/shop3/cart.model.js'

const routeTemplate = {
  onRequest: setCacheNoStoreHeader,
  preHandler: async (request, response) => {
    const { body, params } = request
    request.cart = new Shop3Cart(params.module)

    try {
      if (body.token) {
        const products = verify(body.token).products

        await Promise.all(
          products.map(
            async ({ id, quantity }) =>
              await request.cart.updateItem(id, quantity)
          )
        )
      }
    } catch (error) {
      console.error({ error })
      response.status(400).send({ message: 'invalid token!' })
    }
  }
}

/**
 * Return current cart contents
 */

const getCartController = {
  ...routeTemplate,

  method: 'POST',

  url: '/shop/:module/cart',

  schema: {
    params: {
      type: 'object',
      properties: {
        module: { type: 'number' }
      }
    },
    body: {
      type: 'object',
      properties: {
        token: { type: 'string' }
      }
    }
  },

  /**
   *
   * @param {import('fastify').FastifyRequest} request
   * @param {*} response
   */

  handler: async (request, response) => {
    const { cart } = request
    await cart.calculate()

    response.send({
      cart: cart.getAll(),
      token: sign(cart.export)
    })
  }
}

/**
 * Add a product to cart
 */

const addToCartController = {
  ...routeTemplate,

  method: 'PATCH',

  url: '/shop/:module/cart/add',

  schema: {
    params: {
      type: 'object',
      properties: {
        module: { type: 'number' }
      }
    },
    body: {
      type: 'object',
      required: ['id'],
      properties: {
        id: { type: 'string' } // String, because used as Map().key
      }
    }
  },

  handler: async (request, response) => {
    const { cart, body } = request

    await cart.addItem(body.id)
    await cart.calculate()

    response.send({
      cart: cart.getAll(),
      token: sign(cart.export)
    })
  }
}

/**
 * Update the amount of a product in the cart
 */

const updateCartController = {
  ...routeTemplate,

  method: 'PATCH',

  url: '/shop/:module/cart/update',

  schema: {
    params: {
      type: 'object',
      properties: {
        module: { type: 'number' }
      }
    },
    body: {
      type: 'object',
      required: ['id', 'quantity'],
      properties: {
        id: { type: 'string' }, // String, because used as Map().key
        quantity: { type: 'number' }
      }
    }
  },

  handler: async (request, response) => {
    const { cart, body } = request

    await cart.updateItem(body.id, body.quantity)
    await cart.calculate()

    response.send({
      cart: cart.getAll(),
      token: sign(cart.export)
    })
  }
}

const resetCartController = {
  method: 'DELETE',

  url: '/shop/:module/cart',

  handler: async (request, response) => {
    const { body } = request
    const cart = new Shop3Cart()
    cart.module = body.module

    response.send({
      cart: await cart.get(),
      token: cart.token
    })
  }
}

export default async (App) => {
  App.route(getCartController)
  App.route(addToCartController)
  App.route(updateCartController)
  App.route(resetCartController)
}

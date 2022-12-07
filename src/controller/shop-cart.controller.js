import { cacheNoStore as setCacheNoStoreHeader } from '#hooks/header'
import { ShopCart } from '#model/shop-cart'

const routeTemplate = {
  onRequest: setCacheNoStoreHeader,
  preHandler: async (request, response) => {
    const { body } = request
    const cart = new ShopCart()

    try {
      if (body.token) {
        cart.token = body.token
      } else {
        cart.module = body.module
      }

      request.cart = cart
    } catch (err) {
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

  url: '/shop/cart',

  schema: {
    body: {
      type: 'object',
      required: ['module'],
      properties: {
        module: { type: 'number' }
      }
    }
  },

  handler: async (request, response) => {
    const { cart } = request

    response.send({
      cart: await cart.get(),
      token: cart.token
    })
  }
}

/**
 * Add a product to cart
 */

const addToCartController = {
  ...routeTemplate,

  method: 'PATCH',

  url: '/shop/cart/add',

  schema: {
    body: {
      type: 'object',
      required: ['id', 'module'],
      properties: {
        id: { type: 'string' }, // String, because used as Map().key
        module: { type: 'number' }
      }
    }
  },

  handler: async (request, response) => {
    const { cart, body } = request

    await cart.addItem(body.id)

    response.send({
      cart: await cart.get(),
      token: cart.token
    })
  }
}

/**
 * Update the amount of a product in the cart
 */

const updateCartController = {
  ...routeTemplate,

  method: 'PATCH',

  url: '/shop/cart/update',

  schema: {
    body: {
      type: 'object',
      required: ['id', 'quantity', 'module'],
      properties: {
        id: { type: 'string' }, // String, because used as Map().key
        module: { type: 'number' },
        quantity: { type: 'number' }
      }
    }
  },

  handler: async (request, response) => {
    const { cart, body } = request

    if (body.quantity <= 0) {
      await cart.removeItem(body.id)
    } else {
      await cart.updateItem(body.id, body.quantity)
    }

    response.send({
      cart: await cart.get(),
      token: cart.token
    })
  }
}

const resetCartController = {
  method: 'DELETE',

  url: '/shop/cart',

  schema: {
    body: {
      type: 'object',
      required: ['module'],
      properties: {
        module: { type: 'number' }
      }
    }
  },

  handler: async (request, response) => {
    const { body } = request
    const cart = new ShopCart()
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

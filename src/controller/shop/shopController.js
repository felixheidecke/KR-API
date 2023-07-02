import { secret } from '#config/app.config'
import { COOKIE_NAME } from '#constants'

import cartController from './shopCartController.js'
import categoryController from './shopCategoryController.js'
import productsController from './shopProductsController.js'
import infoController from './shopInfoController.js'
import orderController from './shopOrderController.js'

export default async (App) => {
  App.register(import('@fastify/session'), {
    secret,
    cookieName: COOKIE_NAME('cartSessionId'),
    maxAge: 1800000 // 30 min.
  })

  cartController(App)
  categoryController(App)
  productsController(App)
  infoController(App)
  orderController(App)
}

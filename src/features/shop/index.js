export default function shop(App, _, done) {
  App.register(import('../../common/plugins/authorization.js'), {
    authorize: ['module-match']
  })

  App.register(import('./controller/CartController.js'))
  App.register(import('./controller/GroupController.js'))
  App.register(import('./controller/OrderController.js'))
  App.register(import('./controller/ProductsController.js'))
  App.register(import('./controller/PaymentController.js'))

  done()
}

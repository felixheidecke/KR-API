const routers = async (App) => {
  App.register(import('#src/controller/article.controller.js'))
  App.register(import('#src/controller/event.controller.js'))
  App.register(import('#src/controller/flush.controller.js'))
  App.register(import('#src/controller/form.controller.js'))
  App.register(import('#src/controller/gallery.controller.js'))
  App.register(import('#src/controller/menu-card.controller.js'))
  App.register(import('#src/controller/ping.controller.js'))
  // App.register(import('#src/controller/shop3/shop3-cart.controller.js'))
  // App.register(import('#src/controller/shop3/shop3-category.controller.js'))
  // App.register(import('#src/controller/shop3/shop3-info.controller.js'))
  // App.register(import('#src/controller/shop3/shop3-product.controller.js'))
  // App.register(import('#src/controller/shop3/shop3-order.controller.js'))
}

export default routers

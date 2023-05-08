const routers = async (App) => {
  App.register(import('#controller/article.controller'))
  App.register(import('#controller/articles.controller'))
  App.register(import('#controller/event.controller'))
  App.register(import('#controller/events.controller'))
  App.register(import('#controller/flush.controller'))
  // App.register(import('#controller/formController'))
  // App.register(import('#controller/galleryController'))
  App.register(import('#controller/menu-card.controller'))
  App.register(import('#controller/ping.controller'))
  // App.register(import('#controller/shop3/shop3-cart.controller'))
  // App.register(import('#controller/shop3/shop3-category.controller'))
  // App.register(import('#controller/shop3/shop3-info.controller'))
  // App.register(import('#controller/shop3/shop3-product.controller'))
  // App.register(import('#controller/shop3/shop3-order.controller'))
}

export default routers

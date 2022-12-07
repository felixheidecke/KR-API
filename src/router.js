const routers = async (App) => {
  App.register(import('#controller/article'))
  App.register(import('#controller/event'))
  App.register(import('#controller/flush'))
  App.register(import('#controller/form'))
  App.register(import('#controller/gallery'))
  App.register(import('#controller/menu-card'))
  App.register(import('#controller/ping'))
  App.register(import('#controller/shop-cart'))
  App.register(import('#controller/shop-category'))
  App.register(import('#controller/shop-info'))
  App.register(import('#controller/shop-product'))
}

export default routers

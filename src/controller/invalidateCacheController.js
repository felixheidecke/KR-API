import { cacheNoStoreHook } from '#hooks/headerHooks'

export default async function (App) {
  App.addHook('onRequest', cacheNoStoreHook)

  App.delete('/invalidate-cache/all', {
    handler: (_, response) => {
      redis.FLUSHALL()
      response.code(204).send({
        message: redis.KEYS('*')
      })
    }
  })
}

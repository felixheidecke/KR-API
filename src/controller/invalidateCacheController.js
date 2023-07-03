import { cacheNoStoreHook } from '#hooks/headerHooks'
import redis from '#libs/redis'

export default async function (App) {
  App.addHook('onRequest', cacheNoStoreHook)

  App.delete('/cache', {
    handler: (_, response) => {
      redis.FLUSHALL()
      response.code(204).send()
    }
  })
}

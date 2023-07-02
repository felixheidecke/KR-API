import articleController from '#controller/articleController'
import { HEADER } from '#constants'

export default async function (App) {
  App.addHook('preHandler', async (_, response) => {
    response.header(
      HEADER.CACHE_CONTROL,
      [HEADER.PUBLIC, HEADER.MAX_AGE(3600)].join(', ')
    )
  })

  App.register(articleController)
}

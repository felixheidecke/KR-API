import redis from '#libs/redis'

export default async (App) => {
  App.route({
    method: 'DELETE',

    url: '/flush/all',

    handler: (_, response) => {
      redis.FLUSHALL()
      response.code(204)
    }
  })
}

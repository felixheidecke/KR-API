import type { FastifyInstance } from 'fastify'
import { HEADER, MIME_TYPE } from '../../../constants.js'
import { toSeconds } from '../../../common/utils/convert-time.js'

export default async function (App: FastifyInstance) {
  App.get('/', {
    handler: async function (_, reply) {
      reply
        .header(HEADER.CACHE_CONTROL, `public, max-age=${toSeconds({ hours: 24 })}`)
        .header(HEADER.CONTENT_TYPE, MIME_TYPE.HTML).send(`
        <!doctype html>
        <html lang="de">
          <head>
            <meta charset="UTF-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            <title>API Klickrein</title>
          </head>
          <body>
            <p>Willkommen bei der Klickrein API</p>
          </body>
        </html>
      `)
    }
  })
}

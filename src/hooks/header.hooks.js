import { HEADER } from '#constants'
import pkg from '../../package.json' assert { type: 'json' }

export const message = async (_, response) => {
  response.headers({
    [HEADER.MESSAGE]: 'Klickrhein.de | Ihre Webagentur im Rheingau',
    [HEADER.VERSION]: pkg.version
  })
}

export const cacheNoStore = async (_, response) => {
  response.headers({
    [HEADER.CACHE_CONTROL]: [HEADER.PRIVATE, HEADER.NO_STORE].join(', ')
  })
}

// export const cors = async (request, response) => {
//   const { origin } = request.headers

//   response.headers({
//     'Access-Control-Allow-Origin': origin || '*',
//     'Access-Control-Allow-Credentials': true
//   })

//   console.log(response)
// }

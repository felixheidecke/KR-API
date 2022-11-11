import { HEADER } from '#utils/constants'
import pkg from '../package.json' assert { type: 'json' }

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

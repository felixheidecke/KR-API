import { HEADER, MIME_TYPE } from '#constants'
import pkg from '../../package.json' assert { type: 'json' }

export async function messageHook(_, response) {
  response.headers({
    [HEADER.MESSAGE]: 'Klickrhein.de | Ihre Webagentur im Rheingau',
    [HEADER.VERSION]: pkg.version,
    [HEADER.CONTENT_TYPE]: MIME_TYPE.JSON
  })
}

export async function cacheNoStoreHook(_, response) {
  response.headers({
    [HEADER.CACHE_CONTROL]: [HEADER.PRIVATE, HEADER.NO_STORE].join(', ')
  })
}
